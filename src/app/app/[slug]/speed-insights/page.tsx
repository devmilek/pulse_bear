import { DashboardPage } from "@/components/dashboard-page";
import { loadProjectOrRedirect } from "@/lib/project-loader";
import { loadInsightsSpeedSearchParams } from "@/modules/speed-insights/params";
import { SpeedInsightsHeader } from "@/modules/speed-insights/ui/sections/speed-insights-header";
import { SpeedInsightsView } from "@/modules/speed-insights/ui/views/speed-insights-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";
import React from "react";

interface SpeedInsightsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

const SpeedInsightsPage = async ({
  params,
  searchParams,
}: SpeedInsightsPageProps) => {
  const { slug } = await params;
  const { project } = await loadProjectOrRedirect(slug);
  const { device, percentile, range } =
    await loadInsightsSpeedSearchParams(searchParams);

  prefetch(
    trpc.speedInsights.getMetricsStats.queryOptions({
      projectId: project.id,
      period: range,
      deviceType: device,
      percentile: percentile,
    })
  );

  return (
    <div>
      <DashboardPage title="Speed Insights">
        <SpeedInsightsHeader />
        <HydrateClient>
          <SpeedInsightsView />
        </HydrateClient>
      </DashboardPage>
    </div>
  );
};

export default SpeedInsightsPage;
