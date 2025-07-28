import { SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren, useState } from "react";

import { DashboardSidebar } from "./_components/dashboard-sidebar";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <SidebarProvider>
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Layout;
