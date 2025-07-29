"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EventCategory } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useEventCategoryParams } from "@/hooks/use-event-category-params";

const chartConfig = {
  events: {
    label: "Events",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function EventsChart({ category }: { category: EventCategory }) {
  const [filters, setFilters] = useEventCategoryParams();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.category.getEventsForChart.queryOptions({
      eventId: category.id,
      timeRange: filters.tab,
    })
  );

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);

    if (filters.tab === "today") {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTooltipLabel = (value: string) => {
    const date = new Date(value);

    if (filters.tab === "today") {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getTitle = () => {
    switch (filters.tab) {
      case "today":
        return "Events Today";
      case "week":
        return "Events This Week";
      case "month":
        return "Events This Month";
      default:
        return "Events";
    }
  };

  const getDescription = () => {
    if (!data) return "Loading...";

    const period =
      filters.tab === "today"
        ? "today"
        : filters.tab === "week"
          ? "this week"
          : "this month";

    return `${data.totalEvents} total events ${period}`;
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data?.data || []}>
              <defs>
                <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-events)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-events)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatXAxisLabel}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipLabel}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillEvents)"
                stroke="var(--color-events)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
