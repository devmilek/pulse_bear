"use client";

import { useProjectData } from "@/modules/projects/hooks/use-project-data";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import { MetricKpiCard } from "../components/metric-kpi-card";
import { metricsInfo } from "../../constants";

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

  const metric = metricsInfo[filters.metric];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-5 gap-4 mt-5">
        {data.stats.map((stat) => (
          <MetricKpiCard
            key={stat.metric}
            metric={stat.metric}
            value={stat.value}
            device={filters.device}
            active={filters.metric === stat.metric}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="capitalize text-muted-foreground">{filters.device}</p>
          <h2 className="text-2xl font-semibold">{metric.name}</h2>
        </div>
      </div>
    </div>
  );
};
