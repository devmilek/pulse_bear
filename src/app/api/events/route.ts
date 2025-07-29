import { FREE_QUOTA, PRO_QUOTA } from "@/config";
import { DiscordClient } from "@/lib/discord-client";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { db } from "@/db";
import {
  apiKeys,
  events as eventsSchema,
  quotas,
  subscription,
  users,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSubscriptionActive } from "@/lib/utils";

const REQUEST_VALIDATOR = z
  .object({
    category: CATEGORY_NAME_VALIDATOR,
    fields: z
      .record(z.string(), z.string().or(z.number()).or(z.boolean()))
      .optional(),
    description: z.string().optional(),
  })
  .strict();

export const POST = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Invalid auth header format. Expected: 'Bearer [API_KEY]'",
        },
        { status: 401 }
      );
    }

    const apiKeyHeader = authHeader.split(" ")[1];

    if (!apiKeyHeader || apiKeyHeader.trim() === "") {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 });
    }

    const apiKeyExists = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.apiKey, apiKeyHeader),
    });

    if (!apiKeyExists) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, apiKeyExists?.userId),
      with: {
        eventCategories: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 });
    }

    if (!user.discordId) {
      return NextResponse.json(
        {
          message: "Please enter your discord ID in your account settings",
        },
        { status: 403 }
      );
    }

    // ACTUAL LOGIC
    const currentData = new Date();
    const currentMonth = currentData.getMonth() + 1;
    const currentYear = currentData.getFullYear();

    const quota = await db.query.quotas.findFirst({
      where: and(
        eq(quotas.userId, user.id),
        eq(quotas.month, currentMonth),
        eq(quotas.year, currentYear)
      ),
    });

    const dbSubscription = await db.query.subscription.findFirst({
      where: eq(subscription.userId, user.id),
    });

    const subscriptionActive = isSubscriptionActive(dbSubscription);

    const quotaLimit = subscriptionActive
      ? PRO_QUOTA.maxEventsPerMonth
      : FREE_QUOTA.maxEventsPerMonth;

    if (quota && quota.count >= quotaLimit) {
      return NextResponse.json(
        {
          message:
            "Monthly quota reached. Please upgrade your plan for more events",
        },
        { status: 429 }
      );
    }

    const discord = new DiscordClient(process.env.DISCORD_BOT_TOKEN);

    const dmChannel = await discord.createDM(user.discordId);

    let requestData: unknown;

    try {
      requestData = await req.json();
    } catch (err) {
      return NextResponse.json(
        {
          message: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const validationResult = REQUEST_VALIDATOR.parse(requestData);

    const category = user.eventCategories.find(
      (cat) => cat.name === validationResult.category
    );

    if (!category) {
      return NextResponse.json(
        {
          message: `You dont have a category named "${validationResult.category}"`,
        },
        { status: 404 }
      );
    }

    const eventData = {
      title: `${category.emoji || "🔔"} ${
        category.name.charAt(0).toUpperCase() + category.name.slice(1)
      }`,
      description:
        validationResult.description ||
        `A new ${category.name} event has occurred!`,
      color: category.color,
      timestamp: new Date().toISOString(),
      fields: Object.entries(validationResult.fields || {}).map(
        ([key, value]) => {
          return {
            name: key,
            value: String(value),
            inline: true,
          };
        }
      ),
    };

    const [event] = await db
      .insert(eventsSchema)
      .values({
        name: category.name,
        formattedMessage: `${eventData.title}\n\n${eventData.description}`,
        userId: user.id,
        fields: validationResult.fields || {},
        eventCategoryId: category.id,
      })
      .returning();

    if (!event) {
      return NextResponse.json(
        { message: "Failed to create event" },
        { status: 500 }
      );
    }

    try {
      await discord.sendEmbed(dmChannel.id, eventData);

      await db
        .update(eventsSchema)
        .set({
          deliveryStatus: "DELIVERED",
        })
        .where(eq(eventsSchema.id, event.id));

      await db
        .insert(quotas)
        .values({
          userId: user.id,
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
    } catch (err) {
      await db
        .update(eventsSchema)
        .set({
          deliveryStatus: "FAILED",
        })
        .where(eq(eventsSchema.id, event.id));

      console.log(err);

      return NextResponse.json(
        {
          message: "Error processing event",
          eventId: event.id,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Event processed successfully",
      eventId: event.id,
    });
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.message }, { status: 422 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
