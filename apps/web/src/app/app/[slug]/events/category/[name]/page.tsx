import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/db";
import { eventCategories, events, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { CategoryDetailsView } from "@/modules/category/ui/views/category-details-view";
import { CategoryTimeRangeTabs } from "@/modules/category/ui/components/category-time-range-tabs";

interface CategoryDetailsPageProps {
  params: Promise<{
    name: string;
  }>;
}

const CategoryDetailsPage = async ({ params }: CategoryDetailsPageProps) => {
  const { name } = await params;

  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
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
    <DashboardPage
      title={`${category.emoji} ${category.name} events`}
      cta={<CategoryTimeRangeTabs />}
    >
      <CategoryDetailsView hasEvents={hasEvents} category={category} />
    </DashboardPage>
  );
};

export default CategoryDetailsPage;
