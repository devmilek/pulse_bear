"use client";

import { EventCategory } from "@/db/schema";
import {
  useEventCategoryParams,
  ViewMode,
} from "@/modules/category/hooks/use-event-category-params";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Heading } from "@/components/heading";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListIcon, TableIcon } from "lucide-react";
import { EventsDataTable } from "../components/events-data-table";
import { EventsList } from "../components/events-list";

export const EventsFeed = ({
  hasEvents,
  category,
}: {
  hasEvents: boolean;
  category: EventCategory;
}) => {
  const [filters, setFilters] = useEventCategoryParams();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="w-full flex flex-col gap-4">
          <Heading className="sm:text-3xl">Event overview</Heading>
        </div>
        <Tabs
          value={filters.viewMode}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              viewMode: value as ViewMode,
            }));
          }}
        >
          <TabsList>
            <TabsTrigger value="list">
              <ListIcon /> List
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon /> Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {filters.viewMode === "table" ? (
        <EventsDataTable
          data={data}
          isFetching={isFetching}
          category={category}
        />
      ) : (
        <EventsList data={data} isFetching={isFetching} category={category} />
      )}
    </div>
  );
};
