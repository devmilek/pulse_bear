import { desc, eq, gte, count, and } from "drizzle-orm";
import {
  eventCategories,
  events,
  events as eventSchema,
  users,
} from "@/db/schema";
import { addMonths, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import z from "zod";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { parseColor } from "@/lib/utils";
import { FREE_QUOTA, PRO_QUOTA } from "@/config";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  getEventCategories: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);

    const categories = await db.query.eventCategories.findMany({
      where: eq(eventCategories.userId, user.id),
      columns: {
        id: true,
        name: true,
        emoji: true,
        color: true,
        updatedAt: true,
        createdAt: true,
      },
      with: {
        events: {
          where: gte(eventSchema.createdAt, firstDayOfMonth),
          columns: {
            fields: true,
            createdAt: true,
          },
        },
      },
      orderBy: desc(eventCategories.updatedAt),
    });

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const eventCountResult = await db.$count(
          eventSchema,
          and(
            eq(eventSchema.eventCategoryId, category.id),
            gte(eventSchema.createdAt, firstDayOfMonth)
          )
        );

        const uniqueFieldNames = new Set<string>();
        let lastPing: Date | null = null;

        category.events.forEach((event) => {
          Object.keys(event.fields as object).forEach((fieldName) => {
            uniqueFieldNames.add(fieldName);
          });
          if (!lastPing || event.createdAt > lastPing) {
            lastPing = event.createdAt;
          }
        });

        return {
          id: category.id,
          name: category.name,
          emoji: category.emoji,
          color: category.color,
          updatedAt: category.updatedAt,
          createdAt: category.createdAt,
          uniqueFieldCount: uniqueFieldNames.size,
          eventsCount: eventCountResult,
          lastPing,
        };
      })
    );

    return categoriesWithCounts;
  }),

  deleteCategory: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      await db
        .delete(eventCategories)
        .where(
          and(
            eq(eventCategories.name, name),
            eq(eventCategories.userId, ctx.user.id)
          )
        );
    }),

  createEventCategory: protectedProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        color: z
          .string()
          .min(1, "Color is required")
          .regex(/^#[0-9A-F]{6}$/i, "Invalid color format."),
        emoji: z.string().emoji("Invalid emoji").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { color, name, emoji } = input;

      const categoryCount = await db.$count(
        eventCategories,
        eq(eventCategories.userId, user.id)
      );

      const limits = user.plan === "PRO" ? PRO_QUOTA : FREE_QUOTA;

      if (categoryCount >= limits.maxEventCategories) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You have reached the maximum number of event categories (${limits.maxEventCategories}) for your plan.`,
        });
      }

      const eventCategory = await db
        .insert(eventCategories)
        .values({
          name: name.toLowerCase(),
          color: parseColor(color),
          emoji,
          userId: user.id,
        })
        .returning();

      return { eventCategory };
    }),

  insertQuickstartCategories: protectedProcedure.mutation(async ({ ctx }) => {
    const categories = await db
      .insert(eventCategories)
      .values(
        [
          { name: "bug", emoji: "🐛", color: 0xff6b6b },
          { name: "sale", emoji: "💰", color: 0xffeb3b },
          { name: "question", emoji: "🤔", color: 0x6c5ce7 },
        ].map((category) => ({
          ...category,
          userId: ctx.user.id,
        }))
      )
      .returning();

    return { success: true, count: categories.length };
  }),

  pollCategory: protectedProcedure
    .input(z.object({ name: CATEGORY_NAME_VALIDATOR }))
    .query(async ({ ctx, input }) => {
      const { name } = input;

      const category = await db.query.eventCategories.findFirst({
        where: and(
          eq(eventCategories.name, name),
          eq(eventCategories.userId, ctx.user.id)
        ),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Category "${name}" not found`,
        });
      }

      const eventsCount = await db.$count(
        eventSchema,
        and(
          eq(eventSchema.eventCategoryId, category?.id),
          gte(eventSchema.createdAt, startOfDay(new Date()))
        )
      );

      const hasEvents = eventsCount > 0;

      return { hasEvents };
    }),

  // ...existing code...
  getCategoryStats: protectedProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        timeRange: z.enum(["today", "week", "month"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { name, timeRange } = input;

      const now = new Date();
      let startDate: Date;
      const weekStart = startOfWeek(now, { weekStartsOn: 0 });
      const monthStart = startOfMonth(now);
      const todayStart = startOfDay(now);

      switch (timeRange) {
        case "today":
          startDate = todayStart;
          break;
        case "week":
          startDate = weekStart;
          break;
        case "month":
          startDate = monthStart;
          break;
      }

      // Find the category first to get its ID
      const category = await db.query.eventCategories.findFirst({
        where: and(
          eq(eventCategories.name, name),
          eq(eventCategories.userId, ctx.user.id)
        ),
        columns: { id: true },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Category "${name}" not found`,
        });
      }

      // Get all events for the selected time range
      const events = await db.query.events.findMany({
        where: and(
          eq(eventSchema.eventCategoryId, category.id),
          gte(eventSchema.createdAt, startDate)
        ),
        columns: {
          fields: true,
          createdAt: true,
        },
      });

      // Calculate field statistics
      const fieldStats: Record<
        string,
        {
          total: number;
          today: number;
          thisWeek: number;
          thisMonth: number;
        }
      > = {};

      events.forEach((event) => {
        const eventDate = new Date(event.createdAt);

        Object.entries(event.fields as Record<string, any>).forEach(
          ([field, value]) => {
            if (typeof value === "number") {
              if (!fieldStats[field]) {
                fieldStats[field] = {
                  total: 0,
                  today: 0,
                  thisWeek: 0,
                  thisMonth: 0,
                };
              }

              fieldStats[field].total += value;

              // Check if event is from today
              if (eventDate >= todayStart) {
                fieldStats[field].today += value;
              }

              // Check if event is from this week
              if (eventDate >= weekStart) {
                fieldStats[field].thisWeek += value;
              }

              // Check if event is from this month
              if (eventDate >= monthStart) {
                fieldStats[field].thisMonth += value;
              }
            }
          }
        );
      });

      // Get the relevant field stats based on time range
      const relevantFieldStats: Record<string, number> = {};
      Object.entries(fieldStats).forEach(([field, stats]) => {
        switch (timeRange) {
          case "today":
            relevantFieldStats[field] = stats.today;
            break;
          case "week":
            relevantFieldStats[field] = stats.thisWeek;
            break;
          case "month":
            relevantFieldStats[field] = stats.thisMonth;
            break;
        }
      });

      return {
        eventsCount: events.length,
        fieldStats: relevantFieldStats,
        timeRange,
      };
    }),
  // ...existing code...

  getEventsByCategoryName: protectedProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        page: z.number(),
        limit: z.number().max(50),
        timeRange: z.enum(["today", "week", "month"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { name, page, limit, timeRange } = input;

      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          break;
        case "month":
          startDate = startOfMonth(now);
          break;
      }

      // Find the category first to get its ID
      const category = await db.query.eventCategories.findFirst({
        where: and(
          eq(eventCategories.name, name),
          eq(eventCategories.userId, ctx.user.id)
        ),
        columns: { id: true },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Category "${name}" not found`,
        });
      }

      const [events, eventsCount] = await Promise.all([
        db.query.events.findMany({
          where: and(
            eq(eventSchema.eventCategoryId, category.id),
            gte(eventSchema.createdAt, startDate)
          ),
          limit: limit,
          offset: (page - 1) * limit,
          orderBy: desc(eventSchema.createdAt),
        }),

        db.$count(
          eventSchema,
          and(
            eq(eventSchema.eventCategoryId, category.id),
            gte(eventSchema.createdAt, startDate)
          )
        ),
      ]);

      return {
        events,
        eventsCount,
      };
    }),

  getCategoryByName: protectedProcedure
    .input(z.object({ name: CATEGORY_NAME_VALIDATOR }))
    .query(async ({ ctx, input }) => {
      const { name } = input;
      const category = await db.query.eventCategories.findFirst({
        where: and(
          eq(eventCategories.userId, users.id),
          eq(eventCategories.name, name)
        ),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Category "${name}" not found`,
        });
      }

      const eventsCount = await db.$count(
        events,
        eq(events.eventCategoryId, category.id)
      );

      const hasEvents = eventsCount > 0;

      return {
        category,
        hasEvents,
        eventsCount,
      };
    }),
});
