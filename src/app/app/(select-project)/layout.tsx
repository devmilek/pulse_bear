import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren, useState } from "react";

import ConfirmationDialog from "@/components/confirmation-dialog";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { Project, projects } from "@/db/schema";
import { ProjectDataProvider } from "@/modules/projects/hooks/use-project-data";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DashboardSidebar } from "../[slug]/_components/dashboard-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <NuqsAdapter>
      <SidebarProvider>
        <DashboardSidebar user={user} />
        <SidebarInset className="border">
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
          <ConfirmationDialog />
        </SidebarInset>
      </SidebarProvider>
    </NuqsAdapter>
  );
};

export default Layout;
