import { createTRPCRouter, protectedProcedure } from "../init";
import z from "zod";
import { apiKeys, projects } from "@/db/schema";
import { db } from "@/db";
import cuid from "cuid";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const apiKeysRouter = createTRPCRouter({
  createApiKey: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, projectId } = input;
      const { user } = ctx;

      const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      try {
        const [apiKey] = await db
          .insert(apiKeys)
          .values({
            name: input.name,
            apiKey: `sk_${cuid()}`,
            projectId: project.id,
            userId: user.id,
          })
          .returning();

        return apiKey;
      } catch (e) {
        console.error("Error creating API key:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API Key",
        });
      }
    }),

  getApiKeys: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { projectId } = input;

      const apiKeysList = await db
        .select()
        .from(apiKeys)
        .where(
          and(eq(apiKeys.projectId, projectId), eq(apiKeys.userId, user.id))
        );
      return apiKeysList;
    }),

  deleteApiKey: protectedProcedure
    .input(
      z.object({
        apiKeyId: z.string(),
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
