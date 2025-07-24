"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { isAfter, isToday, startOfMonth, startOfWeek } from "date-fns";

interface EventsStatsGridProps {
  activeTab: "today" | "week" | "month";
  data: any;
}

export const EventsStatsGrid = ({ activeTab, data }: EventsStatsGridProps) => {
  const numericFieldSums = useMemo(() => {
    if (!data?.events || data.events.length === 0) return {};

    const sums: Record<
      string,
      { total: number; thisWeek: number; thisMonth: number; today: number }
    > = {};

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const monthStart = startOfMonth(now);

    data.events.forEach((event: any) => {
      const eventDate = event.createdAt;

      Object.entries(event.fields as object).forEach(([field, value]) => {
        if (typeof value === "number") {
          if (!sums[field]) {
            sums[field] = { total: 0, thisWeek: 0, thisMonth: 0, today: 0 };
          }

          sums[field].total += value;

          if (
            isAfter(eventDate, weekStart) ||
            eventDate.getTime() === weekStart.getTime()
          ) {
            sums[field].thisWeek += value;
          }

          if (
            isAfter(eventDate, monthStart) ||
            eventDate.getTime() === monthStart.getTime()
          ) {
            sums[field].thisMonth += value;
          }

          if (isToday(eventDate)) {
            sums[field].today += value;
          }
        }
      });
    });

    return sums;
  }, [data?.events]);

  const NumericFieldSumCards = () => {
    if (Object.keys(numericFieldSums).length === 0) return null;

    return Object.entries(numericFieldSums).map(([field, sums]) => {
      const relevantSum =
        activeTab === "today"
          ? sums.today
          : activeTab === "week"
          ? sums.thisWeek
          : sums.thisMonth;

      return (
        <Card key={field}>
          <CardContent>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">{relevantSum.toFixed(2)}</p>
              <p className="text-xs/5 text-muted-foreground">
                {activeTab === "today"
                  ? "today"
                  : activeTab === "week"
                  ? "this week"
                  : "this month"}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
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
              {activeTab === "today"
                ? "today"
                : activeTab === "week"
                ? "this week"
                : "this month"}
            </p>
          </div>
        </CardContent>
      </Card>

      <NumericFieldSumCards />
    </div>
  );
};
