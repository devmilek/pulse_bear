import { desc, eq, gte, count, and } from "drizzle-orm";
import { db } from "../db";
import { j, privateProcedure } from "../jstack";
import { eventCategories, events } from "../db/schema";
import { startOfMonth } from "date-fns";

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
});
