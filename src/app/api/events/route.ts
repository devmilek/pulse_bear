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
import { humanizeKey, isSubscriptionActive } from "@/lib/utils";
import {
  checkQuota,
  createEmbed,
  extractApiKey,
  getCategoryByName,
  getUserFromApiKey,
  incrementQuota,
} from "./utils";
import { REQUEST_VALIDATOR } from "./schema";

function error(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export const POST = async (req: NextRequest) => {
  try {
    const apiKey = extractApiKey(req);
    if (!apiKey) return error("Unauthorized", 401);

    const user = await getUserFromApiKey(apiKey);
    if (!user) return error("Invalid API key", 401);
    if (!user.discordId)
      return error(
        "Please enter your Discord ID in your account settings",
        403
      );

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) return error("Invalid JSON request body", 400);

    const data = REQUEST_VALIDATOR.parse(rawBody);

    const category = await getCategoryByName(data.category, user.id);

    if (!category) {
      return error(`You don't have a category named "${data.category}"`, 404);
    }

    const allowed = await checkQuota(user.id);
    if (!allowed)
      return error("Monthly quota reached. Please upgrade your plan.", 429);

    const embed = createEmbed(category, data);
    const discord = new DiscordClient(process.env.DISCORD_BOT_TOKEN);
    const dmChannel = await discord.createDM(user.discordId);

    const [event] = await db
      .insert(eventsSchema)
      .values({
        userId: user.id,
        fields: data.fields || {},
        eventCategoryId: category.id,
        action: data.action,
        description: data.description,
        eventUserId: data.user_id,
      })
      .returning();

    if (!event) return error("Failed to create event", 500);

    try {
      await discord.sendEmbed(dmChannel.id, embed);

      await db
        .update(eventsSchema)
        .set({
          deliveryStatus: "DELIVERED",
        })
        .where(eq(eventsSchema.id, event.id));

      await incrementQuota(user.id);
    } catch (err) {
      await db
        .update(eventsSchema)
        .set({
          deliveryStatus: "FAILED",
        })
        .where(eq(eventsSchema.id, event.id));

      console.error("Discord error:", err);

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
      return error(err.message, 422);
    }

    return error("Internal server error", 500);
  }
};
