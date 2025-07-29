"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/client";
import { EventCategory } from "@/db/schema";
import { EmptyCategoryState } from "./empty-category-state";
import { EventsTabsSection } from "./events-tabs-section";
import { useEventCategoryParams } from "@/hooks/use-event-category-params";
import { EventsStatsGrid } from "./events-stats-grid";
import { EventsDataTable } from "./events-data-table";
import { useTRPC } from "@/trpc/client";

interface CategoryPageContentProps {
  hasEvents: boolean;
  category: EventCategory;
}

export const CategoryPageContent = ({
  hasEvents,
  category,
}: CategoryPageContentProps) => {
  const [filters] = useEventCategoryParams();
  const trpc = useTRPC();

  const { data, isFetching } = useQuery(
    trpc.category.getEventsByCategoryName.queryOptions(
      {
        name: category.name,
        page: filters.pageIndex + 1,
        limit: filters.pageSize,
        timeRange: filters.tab,
      },
      {
        refetchOnWindowFocus: false,
        enabled: hasEvents,
      }
    )
  );

  if (!hasEvents) {
    return <EmptyCategoryState categoryName={category.name} />;
  }

  return (
    <>
      <EventsTabsSection />
      <EventsStatsGrid categoryName={category.name} />
      <EventsDataTable
        data={data}
        isFetching={isFetching}
        category={category}
      />
    </>
  );
};
