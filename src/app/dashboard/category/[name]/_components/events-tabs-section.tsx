"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCategory } from "@/server/db/schema";
import { EventsStatsGrid } from "./events-stats-grid";
import { EventsDataTable } from "./events-data-table";

interface EventsTabsSectionProps {
  activeTab: "today" | "week" | "month";
  setActiveTab: (tab: "today" | "week" | "month") => void;
  data: any;
  isFetching: boolean;
  category: EventCategory;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export const EventsTabsSection = ({
  activeTab,
  setActiveTab,
  data,
  isFetching,
  category,
  pagination,
  setPagination,
}: EventsTabsSectionProps) => {
  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="mb-2">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <EventsStatsGrid activeTab={activeTab} data={data} />
        </TabsContent>
      </Tabs>

      <EventsDataTable
        data={data}
        isFetching={isFetching}
        category={category}
        pagination={pagination}
        setPagination={setPagination}
      />
    </div>
  );
};
