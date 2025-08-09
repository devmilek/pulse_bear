"use client";

import { useProjectData } from "@/modules/projects/hooks/use-project-data";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts";

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
  count: {
    label: "Count",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const MetricChart = () => {
  const trpc = useTRPC();
  const project = useProjectData();
  const [filters] = useSpeedInsightsFilters();

  const { data } = useQuery(
    trpc.speedInsights.getMetricChartData.queryOptions({
      projectId: project.id,
      period: filters.range,
      deviceType: filters.device,
      metric: filters.metric,
      percentile: filters.percentile,
    })
  );

  return (
    <div>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              filters.range === "24h"
                ? new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date(value).toLocaleDateString()
            }
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" hideLabel />}
          />
          <Line
            dataKey="value"
            type="linear"
            fill="var(--color-value)"
            fillOpacity={0.4}
            stroke="var(--color-value)"
          />
          <Area
            dataKey="count"
            type="linear"
            fill="var(--color-count)"
            fillOpacity={0.4}
            stroke="var(--color-count)"
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
