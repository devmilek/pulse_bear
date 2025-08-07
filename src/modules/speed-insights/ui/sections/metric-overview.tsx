"use client";

import React from "react";
import { MetricInfo } from "../../constants";
import { DeviceType } from "@/db/schema";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { CategoryBar } from "@/components/tremor/category-bar";
import { Badge } from "@/components/ui/badge";
import { Waypoints } from "lucide-react";

export const MetricOverview = ({
  metricInfo,
  value,
  dataPoints,
}: {
  metricInfo: MetricInfo;
  value: number | null | undefined;
  dataPoints: number;
}) => {
  const [filters] = useSpeedInsightsFilters();
  const thresholds = metricInfo.thresholds[filters.device];
  const goodMax = thresholds.good.max;
  const needsImprovementMax = thresholds.needsImprovement.max;

  const getValueColor = () => {
    if (value === null || value === undefined) return "text-gray-500"; // Handle null case
    if (value <= goodMax) return "text-emerald-600";
    if (value <= needsImprovementMax) return "text-amber-600";
    return "text-pink-600";
  };

  const getValueRate = () => {
    if (value === null || value === undefined) return "-"; // Handle null case
    if (value <= goodMax) return "Good";
    if (value <= needsImprovementMax) return "Needs Improvement";
    return "Poor";
  };

  const categoryValues = [
    goodMax, // Good range
    needsImprovementMax - goodMax, // Needs improvement range
    Math.max(
      value ? value * 1.2 : needsImprovementMax + 1000,
      needsImprovementMax + 1000
    ) - needsImprovementMax, // Poor range (extend beyond current value or reasonable max)
  ];

  return (
    <div>
      <p className="capitalize text-muted-foreground">{filters.device}</p>
      <div className="flex items-center gap-4 mt-2">
        <h2 className="text-2xl font-semibold">{metricInfo.name}</h2>
        <Badge variant="outline">
          <Waypoints />
          {dataPoints} data points
        </Badge>
      </div>
      {/* check if its great, needs improvement or poor */}
      <div className="mt-4">
        <p className="text-2xl font-bold mb-2">
          <span className={getValueColor()}>
            {value !== null ? value?.toFixed(2) : "-"}
          </span>{" "}
          {metricInfo.unit && value && (
            <span className="text-muted-foreground text-sm font-normal">
              {metricInfo.unit}
            </span>
          )}
        </p>
        <CategoryBar
          values={categoryValues}
          className="h-1"
          marker={
            value
              ? {
                  value: value, // Use 0 if value is null
                  showAnimation: true,
                }
              : undefined
          }
          showLabels={false}
          // className=""
          colors={["emerald", "amber", "pink"]}
        />
      </div>
      <h3 className="text-lg font-semibold mt-8">{getValueRate()}</h3>
      <p className="text-sm text-muted-foreground">
        More than {filters.percentile}% of visits scored a{" "}
        {getValueRate().toLowerCase()} {filters.metric}
      </p>
      <Separator className="my-5" />
      <div className="space-y-4">
        <div>
          <Label>What it measures:</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {" "}
            {metricInfo.description}
          </p>
        </div>
        <div>
          <Label>Why it matters:</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {metricInfo.whyItMatters}
          </p>
        </div>
      </div>
    </div>
  );
};
