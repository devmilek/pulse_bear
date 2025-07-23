import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/server/db";
import { eventCategories, events, users } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { CategoryPageContent } from "./_components/category-page-content";

interface CategoryDetailsPageProps {
  params: Promise<{
    name: string;
  }>;
}

const CategoryDetailsPage = async ({ params }: CategoryDetailsPageProps) => {
  const { name } = await params;

  const auth = await currentUser();

  if (!auth) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.externalId, auth.id),
  });

  if (!user) {
    redirect("/sign-up");
  }

  const category = await db.query.eventCategories.findFirst({
    where: and(
      eq(eventCategories.userId, user.id),
      eq(eventCategories.name, name)
    ),
  });

  if (!category) {
    notFound();
  }

  const eventsCount = await db.$count(
    events,
    eq(events.eventCategoryId, category.id)
  );

  const hasEvents = eventsCount > 0;

  return (
    <DashboardPage title={`${category.emoji} ${category.name} events`}>
      <CategoryPageContent hasEvents={hasEvents} category={category} />
    </DashboardPage>
  );
};

export default CategoryDetailsPage;
