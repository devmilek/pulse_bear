import { db } from "@/db";
import { createTRPCRouter, protectedProcedure } from "../init";
import { addMonths, startOfMonth } from "date-fns";
import { eventCategories, quotas, subscription, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { FREE_QUOTA, PRO_QUOTA } from "@/config";
import z from "zod";
import { isSubscriptionActive } from "@/lib/utils";

export const projectRouter = createTRPCRouter({
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const currentDate = startOfMonth(new Date());

    const userSubscription = await db.query.subscription.findFirst({
      where: eq(subscription.userId, user.id),
    });

    const subscriptionActive = isSubscriptionActive(userSubscription);

    const eventsQuota = await db.query.quotas.findFirst({
      where: and(
        eq(quotas.userId, user.id),
        eq(quotas.year, currentDate.getFullYear()),
        eq(quotas.month, currentDate.getMonth() + 1),
        eq(quotas.kind, "EVENTS")
      ),
    });

    const speedInsightsQuota = await db.query.quotas.findFirst({
      where: and(
        eq(quotas.userId, user.id),
        eq(quotas.year, currentDate.getFullYear()),
        eq(quotas.month, currentDate.getMonth() + 1),
        eq(quotas.kind, "SPEED_INSIGHTS")
      ),
    });

    const eventCount = eventsQuota?.count ?? 0;
    const speedInsightsCount = speedInsightsQuota?.count ?? 0;

    const categoryCount = await db.$count(
      eventCategories,
      eq(eventCategories.userId, user.id)
    );

    const limits = subscriptionActive ? PRO_QUOTA : FREE_QUOTA;

    const resetDate = addMonths(currentDate, 1);

    return {
      subscriptionActive,
      categoriesUsed: categoryCount,
      categoriesLimit: limits.maxEventCategories,
      eventsUsed: eventCount,
      eventsLimit: limits.maxEventsPerMonth,
      speedInsightsUsed: speedInsightsCount,
      speedInsightsLimit: limits.maxSpeedInsightsDataPoints,
      resetDate,
    };
  }),

  setDiscordID: protectedProcedure
    .input(z.object({ discordId: z.string().max(20) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { discordId } = input;

      await db
        .update(users)
        .set({
          discordId,
        })
        .where(eq(users.id, user.id));
    }),
});
