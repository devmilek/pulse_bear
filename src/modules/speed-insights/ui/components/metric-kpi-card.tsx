import { DeviceType, Metric } from "@/db/schema/web-vitals";
import React from "react";
import { CategoryBar } from "@/components/tremor/category-bar";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import { metricsInfo } from "../../constants";
import { cn } from "@/lib/utils";

export const MetricKpiCard = ({
  metric,
  value,
  device,
  active,
}: {
  metric: Metric;
  value: number | null;
  device: DeviceType;
  active: boolean;
}) => {
  const metricInfo = metricsInfo[metric];
  const thresholds = metricInfo.thresholds[device];
  const goodMax = thresholds.good.max;
  const needsImprovementMax = thresholds.needsImprovement.max;
  const [filters, setFilters] = useSpeedInsightsFilters();

  // Calculate category bar values based on thresholds
  const categoryValues = [
    goodMax, // Good range
    needsImprovementMax - goodMax, // Needs improvement range
    Math.max(
      value !== null ? value * 1.2 : needsImprovementMax + 1000,
      needsImprovementMax + 1000
    ) - needsImprovementMax, // Poor range (extend beyond current value or reasonable max)
  ];

  const getValueColor = () => {
    if (value === null) return "text-gray-500"; // Handle null case
    if (value <= goodMax) return "text-emerald-600";
    if (value <= needsImprovementMax) return "text-amber-600";
    return "text-pink-600";
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 hover:bg-accent transition-colors cursor-pointer",
        active && "bg-accent"
      )}
      onClick={() => {
        setFilters(() => ({
          metric,
        }));
      }}
    >
      <h3 className="text-sm font-medium mb-3">{metricInfo.name}</h3>
      <p className="text-2xl font-bold mb-2">
        <span className={getValueColor()}>
          {value !== null ? value.toFixed(2) : "-"}
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
          value !== null
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
  );
};
