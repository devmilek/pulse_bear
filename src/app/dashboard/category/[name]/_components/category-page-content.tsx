"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/client";
import { EventCategory } from "@/server/db/schema";
import { EmptyCategoryState } from "./empty-category-state";
import { EventsTabsSection } from "./events-tabs-section";
import { useEventCategoryParams } from "@/hooks/use-event-category-params";
import { EventsStatsGrid } from "./events-stats-grid";
import { EventsDataTable } from "./events-data-table";

interface CategoryPageContentProps {
  hasEvents: boolean;
  category: EventCategory;
}

export const CategoryPageContent = ({
  hasEvents: initialHasEvents,
  category,
}: CategoryPageContentProps) => {
  const [filters] = useEventCategoryParams();

  const { data: pollingData } = useQuery({
    queryKey: ["category", category.name, "hasEvents"],
    initialData: { hasEvents: initialHasEvents },
  });

  const { data, isFetching } = useQuery({
    queryKey: [
      "events",
      category.name,
      filters.tab,
      filters.pageIndex,
      filters.pageSize,
    ],
    queryFn: async () => {
      const res = await client.category.getEventsByCategoryName.$get({
        name: category.name,
        page: filters.pageIndex + 1,
        limit: filters.pageSize,
        timeRange: filters.tab,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      const result = await res.json();

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    refetchOnWindowFocus: false,
    enabled: pollingData.hasEvents,
  });

  if (!pollingData.hasEvents) {
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
