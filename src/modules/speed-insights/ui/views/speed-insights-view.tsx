"use client";

import { useProjectData } from "@/modules/projects/hooks/use-project-data";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import { MetricKpiCard } from "../components/metric-kpi-card";

export const SpeedInsightsView = () => {
  const project = useProjectData();
  const trpc = useTRPC();
  const [filters] = useSpeedInsightsFilters();

  const { data } = useSuspenseQuery(
    trpc.speedInsights.getMetricsStats.queryOptions({
      projectId: project.id,
      period: filters.range,
      deviceType: filters.device,
      percentile: filters.percentile,
    })
  );

  return (
    <div className="grid grid-cols-5 gap-4 mt-5">
      {data.stats.map((stat) => (
        <MetricKpiCard
          key={stat.metric}
          metric={stat.metric}
          value={stat.value}
          device={filters.device}
        />
      ))}
    </div>
  );
};
