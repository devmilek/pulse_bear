import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren, useState } from "react";

import { DashboardSidebar } from "./_components/dashboard-sidebar";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { Project, projects } from "@/db/schema";
import { loadProjectOrRedirect } from "@/lib/project-loader";
import { ProjectDataProvider } from "@/modules/projects/hooks/use-project-data";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const slug = (await params).slug;
  const { user, project } = await loadProjectOrRedirect(slug);

  return (
    <ProjectDataProvider project={project}>
      <SidebarProvider>
        <DashboardSidebar user={user} project={project} />
        <SidebarInset className="border">
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
          <ConfirmationDialog />
        </SidebarInset>
      </SidebarProvider>
    </ProjectDataProvider>
  );
};

export default Layout;
