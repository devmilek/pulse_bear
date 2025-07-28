import z from "zod";
import { j, privateProcedure } from "../jstack";
import crypto from "crypto";
import * as argon2 from "argon2";
import { db } from "../db";
import { apiKeys } from "../db/schema";
import { HTTPException } from "hono/http-exception";
import { desc, eq } from "drizzle-orm";

export const apiKeysRouter = j.router({
  createApiKey: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ ctx, input, c }) => {
      const { user } = ctx;
      const { name } = input;

      const [apiKey] = await db
        .insert(apiKeys)
        .values({
          userId: user.id,
          name,
        })
        .returning();

      if (!apiKey) {
        throw new HTTPException(500, {
          message: "Failed to create API key",
        });
      }

      return c.superjson(apiKey);
    }),

  getApiKeys: privateProcedure.query(async ({ ctx, c }) => {
    const { user } = ctx;

    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, user.id))
      .orderBy(desc(apiKeys.createdAt));

    return c.superjson(keys);
  }),
});
