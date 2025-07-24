"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { isAfter, isToday, startOfMonth, startOfWeek } from "date-fns";
import { useEventCategoryParams } from "@/hooks/use-event-category-params";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export const EventsStatsGrid = ({ categoryName }: { categoryName: string }) => {
  const [filters] = useEventCategoryParams();
  const { data, isFetching } = useQuery({
    queryKey: ["stats", categoryName, filters.tab],
    queryFn: async () => {
      const res = await client.category.getCategoryStats.$get({
        name: categoryName,
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
  });

  const NumericFieldSumCards = () => {
    if (!data?.fieldStats || Object.keys(data.fieldStats).length === 0) {
      return null;
    }

    return Object.entries(data.fieldStats).map(([field, value]) => (
      <Card key={field}>
        <CardContent>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm/6 font-medium">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </p>
            <BarChart className="size-4 text-muted-foreground" />
          </div>

          <div>
            <p className="text-2xl font-bold">{value.toFixed(2)}</p>
            <p className="text-xs/5 text-muted-foreground">
              {filters.tab === "today"
                ? "today"
                : filters.tab === "week"
                ? "this week"
                : "this month"}
            </p>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-brand-700">
          <CardContent>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">Total Events</p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">{data?.eventsCount || 0}</p>
              <p className="text-xs/5 text-muted-foreground">
                Events{" "}
                {filters.tab === "today"
                  ? "today"
                  : filters.tab === "week"
                  ? "this week"
                  : "this month"}
              </p>
            </div>
          </CardContent>
        </Card>

        <NumericFieldSumCards />
      </div>
    </>
  );
};
