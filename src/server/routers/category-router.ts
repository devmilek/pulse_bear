import { desc, eq, gte, count, and } from "drizzle-orm";
import { db } from "../db";
import { j, privateProcedure } from "../jstack";
import { eventCategories, events as eventSchema } from "../db/schema";
import { startOfDay, startOfMonth, startOfWeek } from "date-fns";
import z from "zod";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { parseColor } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";

export const categoryRouter = j.router({
  getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
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

    return c.superjson({ categories: categoriesWithCounts });
  }),

  deleteCategory: privateProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ c, input, ctx }) => {
      const { name } = input;

      await db
        .delete(eventCategories)
        .where(
          and(
            eq(eventCategories.name, name),
            eq(eventCategories.userId, ctx.user.id)
          )
        );

      return c.json({ success: true });
    }),

  createEventCategory: privateProcedure
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
    .mutation(async ({ c, ctx, input }) => {
      const { user } = ctx;
      const { color, name, emoji } = input;

      const eventCategory = await db
        .insert(eventCategories)
        .values({
          name: name.toLowerCase(),
          color: parseColor(color),
          emoji,
          userId: user.id,
        })
        .returning();

      return c.json({ eventCategory });
    }),

  insertQuickstartCategories: privateProcedure.mutation(async ({ ctx, c }) => {
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

    return c.json({ success: true, count: categories.length });
  }),

  pollCategory: privateProcedure
    .input(z.object({ name: CATEGORY_NAME_VALIDATOR }))
    .query(async ({ c, ctx, input }) => {
      const { name } = input;

      const category = await db.query.eventCategories.findFirst({
        where: and(
          eq(eventCategories.name, name),
          eq(eventCategories.userId, ctx.user.id)
        ),
      });

      if (!category) {
        throw new HTTPException(404, {
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

      return c.json({ hasEvents });
    }),

  getEventsByCategoryName: privateProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        page: z.number(),
        limit: z.number().max(50),
        timeRange: z.enum(["today", "week", "month"]),
      })
    )
    .query(async ({ c, ctx, input }) => {
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
        return c.json({ error: "Category not found" }, 404);
      }

      const [events, eventsCount, uniqueFieldCount] = await Promise.all([
        // Get paginated events
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

        // Get unique field count
        db.query.events
          .findMany({
            where: and(
              eq(eventSchema.eventCategoryId, category.id),
              gte(eventSchema.createdAt, startDate)
            ),
            columns: {
              fields: true,
            },
          })
          .then((events) => {
            const fieldNames = new Set<string>();
            events.forEach((event) => {
              Object.keys(event.fields as object).forEach((fieldName) => {
                fieldNames.add(fieldName);
              });
            });
            return fieldNames.size;
          }),
      ]);

      return c.superjson({
        events,
        eventsCount,
        uniqueFieldCount,
      });
    }),
});
