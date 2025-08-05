import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren, useState } from "react";

import { DashboardSidebar } from "./_components/dashboard-sidebar";
import ConfirmationDialog from "@/components/confirmation-dialog";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <SidebarProvider>
        <DashboardSidebar />
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
