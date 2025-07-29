"use client";

import { EventCategory } from "@/db/schema";
import { EmptyCategoryState } from "./empty-category-state";
import { EventsStatsGrid } from "./events-stats-grid";
import { EventsFeed } from "./events-feed";
import { EventsChart } from "./events-chart";

interface CategoryPageContentProps {
  hasEvents: boolean;
  category: EventCategory;
}

export const CategoryPageContent = ({
  hasEvents,
  category,
}: CategoryPageContentProps) => {
  if (!hasEvents) {
    return <EmptyCategoryState categoryName={category.name} />;
  }

  return (
    <div className="space-y-8">
      <EventsStatsGrid category={category} />
      <EventsChart category={category} />
      <EventsFeed category={category} hasEvents={hasEvents} />
    </div>
  );
};
