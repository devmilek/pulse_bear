import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren, useState } from "react";

import { DashboardSidebar } from "./_components/dashboard-sidebar";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { projects } from "@/db/schema";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { user } = await getCurrentSession();
  const { slug } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.slug, slug), eq(projects.userId, user.id)),
  });

  if (!project) {
    notFound();
  }

  return (
    <>
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
    </>
  );
};

export default Layout;
