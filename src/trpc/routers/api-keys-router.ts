import { createTRPCRouter, protectedProcedure } from "../init";
import z from "zod";
import { apiKeys } from "@/db/schema";
import { db } from "@/db";
import cuid from "cuid";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const apiKeysRouter = createTRPCRouter({
  createApiKey: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name } = input;
      const { user } = ctx;

      const [apiKey] = await db
        .insert(apiKeys)
        .values({
          name: input.name,
          userId: user.id,
          apiKey: `sk_${cuid()}`,
        })
        .returning();

      return apiKey;
    }),

  getApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const apiKeysList = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, user.id));

    return apiKeysList;
  }),

  deleteApiKey: protectedProcedure
    .input(
      z.object({
        apiKeyId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { apiKeyId } = input;
      const { user } = ctx;

      try {
        const apiKey = await db
          .select()
          .from(apiKeys)
          .where(and(eq(apiKeys.id, apiKeyId), eq(apiKeys.userId, user.id)));

        if (!apiKey.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "API Key not found",
          });
        }

        await db
          .delete(apiKeys)
          .where(and(eq(apiKeys.id, apiKeyId), eq(apiKeys.userId, user.id)));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete API Key",
        });
      }
    }),
});
