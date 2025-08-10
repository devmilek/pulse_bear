"use client";

import { EventCategory } from "@/db/schema";
import { CategoryEmptyState } from "./category-empty-state";
import { EventsStatsGrid } from "../sections/events-stats-grid";
import { EventsChart } from "../sections/events-chart";
import { EventsFeed } from "../sections/events-feed";

interface CategoryPageContentProps {
  hasEvents: boolean;
  category: EventCategory;
}

export const CategoryDetailsView = ({
  hasEvents,
  category,
}: CategoryPageContentProps) => {
  if (!hasEvents) {
    return <CategoryEmptyState categoryName={category.name} />;
  }

  return (
    <div className="space-y-8">
      <EventsStatsGrid category={category} />
      <EventsChart category={category} />
      <EventsFeed category={category} hasEvents={hasEvents} />
    </div>
  );
};
