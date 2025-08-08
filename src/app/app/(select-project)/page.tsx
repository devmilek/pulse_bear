import { DashboardPage } from "@/components/dashboard-page";
import { SelectProjectView } from "@/modules/projects/ui/views/select-project-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import React from "react";

const AppPage = async () => {
  prefetch(trpc.projects.list.queryOptions());

  return (
    <DashboardPage title="Select project" hideBackButton>
      <HydrateClient>
        <SelectProjectView />
      </HydrateClient>
    </DashboardPage>
  );
};

export default AppPage;
