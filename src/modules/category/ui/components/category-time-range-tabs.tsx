"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tab,
  useEventCategoryParams,
} from "../../hooks/use-event-category-params";

export const CategoryTimeRangeTabs = () => {
  const [filters, setFilters] = useEventCategoryParams();
  return (
    <Tabs
      value={filters.tab}
      onValueChange={(value) => {
        setFilters({ tab: value as Tab });
      }}
    >
      <TabsList className="mb-2">
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="week">This Week</TabsTrigger>
        <TabsTrigger value="month">This Month</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
