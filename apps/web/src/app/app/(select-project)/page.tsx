import { DashboardPage } from "@/components/dashboard-page";
import { SelectProjectView } from "@/modules/projects/ui/views/select-project-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import React from "react";

const AppPage = async () => {
  return (
    <DashboardPage>
      <HydrateClient>
        <SelectProjectView />
      </HydrateClient>
    </DashboardPage>
  );
};

export default AppPage;
