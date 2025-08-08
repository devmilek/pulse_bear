// lib/project-loader.ts
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "./auth/get-current-session";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { projects } from "@/db/schema";
import { cache } from "react";

export const loadProjectOrRedirect = cache(async (slug: string) => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.slug, slug), eq(projects.userId, user.id)),
  });

  if (!project) {
    notFound();
  }

  return { user, project };
});
