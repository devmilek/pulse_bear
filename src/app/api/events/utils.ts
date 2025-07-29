import { FREE_QUOTA, PRO_QUOTA } from "@/config";
import { db } from "@/db";
import {
  apiKeys,
  eventCategories,
  quotas,
  subscription,
  users,
} from "@/db/schema";
import { humanizeKey, isSubscriptionActive } from "@/lib/utils";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { REQUEST_VALIDATOR } from "./schema";
import z from "zod";

export function extractApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const key = authHeader.split(" ")[1];
  return key?.trim() || null;
}

export async function getUserFromApiKey(apiKey: string) {
  const apiKeyExists = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.apiKey, apiKey),
  });

  if (!apiKeyExists) return null;

  return db.query.users.findFirst({
    where: eq(users.id, apiKeyExists.userId),
  });
}

export const getCategoryByName = async (
  categoryName: string,
  userId: string
) => {
  return db.query.eventCategories.findFirst({
    where: and(
      eq(eventCategories.name, categoryName),
      eq(eventCategories.userId, userId)
    ),
  });
};

export async function checkQuota(userId: string): Promise<boolean> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const quota = await db.query.quotas.findFirst({
    where: and(
      eq(quotas.userId, userId),
      eq(quotas.month, currentMonth),
      eq(quotas.year, currentYear)
    ),
  });

  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  const limit = isSubscriptionActive(sub)
    ? PRO_QUOTA.maxEventsPerMonth
    : FREE_QUOTA.maxEventsPerMonth;

  return !quota || quota.count < limit;
}

export function createEmbed(
  category: any,
  data: z.infer<typeof REQUEST_VALIDATOR>
) {
  return {
    title: `${category.emoji || "🔔"} ${
      category.name.charAt(0).toUpperCase() + category.name.slice(1)
    } - ${data.action}`,
    description:
      data.description || `A new ${category.name} event has occurred!`,
    color: category.color,
    timestamp: new Date().toISOString(),
    fields: Object.entries(data.fields || {}).map(([key, value]) => ({
      name: humanizeKey(key),
      value: String(value),
      inline: true,
    })),
  };
}

export async function incrementQuota(userId: string) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await db
    .insert(quotas)
    .values({
      userId,
      month: currentMonth,
      year: currentYear,
      count: 1,
    })
    .onConflictDoUpdate({
      target: [quotas.userId, quotas.month, quotas.year],
      set: {
        count: sql`${quotas.count} + 1`,
      },
    });
}
