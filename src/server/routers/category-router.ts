import { desc, eq, gte, count, and } from "drizzle-orm";
import { db } from "../db";
import { j, privateProcedure } from "../jstack";
import { eventCategories, events } from "../db/schema";
import { startOfMonth } from "date-fns";
import z from "zod";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { parseColor } from "@/lib/utils";

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
          where: gte(events.createdAt, firstDayOfMonth),
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
          events,
          and(
            eq(events.eventCategoryId, category.id),
            gte(events.createdAt, firstDayOfMonth)
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
});
