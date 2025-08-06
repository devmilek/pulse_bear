import { db } from "@/db";
import { projects } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message:
            "Slug must be lowercase and can only contain letters, numbers, and hyphens",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, slug } = input;

      try {
        const [project] = await db
          .insert(projects)
          .values({
            userId: user.id,
            name,
            slug,
          })
          .returning();

        if (!project) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        return project;
      } catch (error) {
        console.error("Error creating project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }
    }),

  checkSlug: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1, "Slug is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { slug } = input;
      const { user } = ctx;

      try {
        const existingProject = await db
          .select()
          .from(projects)
          .where(and(eq(projects.slug, slug), eq(projects.userId, user.id)))
          .limit(1);

        return existingProject.length === 0;
      } catch (error) {
        console.error("Error checking project slug:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check project slug",
        });
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    try {
      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, user.id));

      return userProjects;
    } catch (error) {
      console.error("Error listing projects:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list projects",
      });
    }
  }),
});
