import { addMonths, startOfMonth } from "date-fns";
import { FREE_QUOTA, PRO_QUOTA } from "@/config";
import { z } from "zod";
import { j, privateProcedure } from "../jstack";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { eventCategories, quotas, users } from "../db/schema";

export const projectRouter = j.router({
  getUsage: privateProcedure.query(async ({ c, ctx }) => {
    const { user } = ctx;

    const currentDate = startOfMonth(new Date());

    const quota = await db.query.quotas.findFirst({
      where: and(
        eq(quotas.userId, user.id),
        eq(quotas.year, currentDate.getFullYear()),
        eq(quotas.month, currentDate.getMonth() + 1)
      ),
    });

    const eventCount = quota?.count ?? 0;

    const categoryCount = await db.$count(
      eventCategories,
      eq(eventCategories.userId, user.id)
    );

    const limits = user.plan === "PRO" ? PRO_QUOTA : FREE_QUOTA;

    const resetDate = addMonths(currentDate, 1);

    return c.superjson({
      categoriesUsed: categoryCount,
      categoriesLimit: limits.maxEventCategories,
      eventsUsed: eventCount,
      eventsLimit: limits.maxEventsPerMonth,
      resetDate,
    });
  }),

  setDiscordID: privateProcedure
    .input(z.object({ discordId: z.string().max(20) }))
    .mutation(async ({ c, ctx, input }) => {
      const { user } = ctx;
      const { discordId } = input;

      await db
        .update(users)
        .set({
          discordId,
        })
        .where(eq(users.id, user.id));

      return c.json({ success: true });
    }),
});
