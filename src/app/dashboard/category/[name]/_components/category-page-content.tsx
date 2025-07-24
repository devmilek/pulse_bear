"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/client";
import { EventCategory } from "@/server/db/schema";
import { EmptyCategoryState } from "./empty-category-state";
import { EventsTabsSection } from "./events-tabs-section";

interface CategoryPageContentProps {
  hasEvents: boolean;
  category: EventCategory;
}

export const CategoryPageContent = ({
  hasEvents: initialHasEvents,
  category,
}: CategoryPageContentProps) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">(
    "today"
  );

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  const [pagination, setPagination] = useState({
    pageIndex: page - 1,
    pageSize: limit,
  });

  const { data: pollingData } = useQuery({
    queryKey: ["category", category.name, "hasEvents"],
    initialData: { hasEvents: initialHasEvents },
  });

  const { data, isFetching } = useQuery({
    queryKey: [
      "events",
      category.name,
      pagination.pageIndex,
      pagination.pageSize,
      activeTab,
    ],
    queryFn: async () => {
      const res = await client.category.getEventsByCategoryName.$get({
        name: category.name,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        timeRange: activeTab,
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
    <EventsTabsSection
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      data={data}
      isFetching={isFetching}
      category={category}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};
