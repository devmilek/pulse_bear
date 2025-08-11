import { useProjectData } from "@/modules/projects/hooks/use-project-data";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import { BarList } from "@/components/tremor/bar-list";
import { metricsInfo } from "../../constants";
import { DeviceType } from "@/db/schema";
import { AlertCircleIcon, ChartBarIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatSeconds } from "@/lib/utils";

const valueFormatter = (number: number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

type Category = "good" | "needsImprovement" | "poor";

function getCategory(
  metric: keyof typeof metricsInfo,
  value: number,
  device: DeviceType
): Category {
  const t = metricsInfo[metric].thresholds[device];
  if (value >= t.good.min && value <= t.good.max) return "good";
  if (value >= t.needsImprovement.min && value <= t.needsImprovement.max)
    return "needsImprovement";
  return "poor";
}

export const RoutesList = () => {
  const project = useProjectData();
  const trpc = useTRPC();
  const [filters] = useSpeedInsightsFilters();

  const { data } = useQuery(
    trpc.speedInsights.getRoutesData.queryOptions({
      projectId: project.id,
      period: filters.range,
      deviceType: filters.device,
      percentile: filters.percentile,
      metric: filters.metric,
    })
  );

  const metricInfo = metricsInfo[filters.metric];
  const thresholds = metricInfo.thresholds[filters.device];

  const items = (data ?? []).map(({ route, value, count }) => {
    const category = getCategory(filters.metric, value, filters.device);
    return {
      name: route,
      value,
      route,
      count,
      category,
    };
  });

  const categoryConfigs: Record<
    Category,
    {
      title: string;
      titleClass: string;
      caption: string;
      sort: (a: (typeof items)[number], b: (typeof items)[number]) => number;
    }
  > = {
    poor: {
      title: "Poor",
      titleClass: "text-red-600",
      caption:
        metricInfo.unit === "ms"
          ? `> ${formatSeconds(thresholds.poor.min)}`
          : `> ${thresholds.poor.min} ${metricInfo.unit}`,
      sort: (a, b) => b.value - a.value, // najgorsze najpierw
    },
    needsImprovement: {
      title: "Needs improvement",
      titleClass: "text-yellow-600",
      caption:
        metricInfo.unit === "ms"
          ? `${formatSeconds(thresholds.needsImprovement.min)}–${formatSeconds(thresholds.needsImprovement.max)}`
          : `${thresholds.needsImprovement.min}–${thresholds.needsImprovement.max} ${metricInfo.unit}`,
      sort: (a, b) => b.value - a.value, // gorsze najpierw
    },
    good: {
      title: "Good",
      titleClass: "text-emerald-600",
      caption:
        metricInfo.unit === "ms"
          ? `≤ ${formatSeconds(thresholds.good.max)}`
          : `≤ ${thresholds.good.max} ${metricInfo.unit}`,
      sort: (a, b) => a.value - b.value, // najlepsze najpierw
    },
  };

  const sections: Category[] = ["poor", "needsImprovement", "good"];

  return (
    <div className="grid grid-cols-1 @4xl:grid-cols-3 gap-6">
      {sections.map((cat) => {
        const cfg = categoryConfigs[cat];
        const list = items.filter((i) => i.category === cat).sort(cfg.sort);

        return (
          <Card key={cat} className="border rounded-lg">
            <CardHeader className="">
              <CardTitle
                className={`flex items-center gap-2 font-medium ${cfg.titleClass}`}
              >
                <AlertCircleIcon className="size-4" /> {cfg.title}
              </CardTitle>
              <CardAction className="text-muted-foreground text-sm">
                {cfg.caption}
              </CardAction>
            </CardHeader>
            <CardContent>
              <BarList
                data={list}
                valueFormatter={
                  metricInfo.unit === "ms" ? formatSeconds : valueFormatter
                }
              />
              {list.length === 0 && (
                <div className="mt-4 flex h-44 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ChartBarBigIcon
                      className="mx-auto size-5"
                      aria-hidden={true}
                    />
                    <p className="mt-2 font-medium text-sm">No data to show</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
// ...existing code...
