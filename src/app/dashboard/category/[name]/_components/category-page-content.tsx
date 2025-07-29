"use client";

import { useQuery } from "@tanstack/react-query";
import { EventCategory } from "@/db/schema";
import { EmptyCategoryState } from "./empty-category-state";
import { EventsTabsSection } from "./events-tabs-section";
import { useEventCategoryParams } from "@/hooks/use-event-category-params";
import { EventsStatsGrid } from "./events-stats-grid";
import { EventsDataTable } from "./events-data-table";
import { useTRPC } from "@/trpc/client";
import { EventsList } from "./events-list";
import { EventsFeed } from "./events-feed";

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
    <>
      <EventsTabsSection />
      <EventsStatsGrid categoryName={category.name} />
      <EventsFeed category={category} hasEvents={hasEvents} />
    </>
  );
};
