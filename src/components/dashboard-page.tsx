"use client";

import { ReactNode } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, MenuIcon } from "lucide-react";
import { Heading } from "./heading";
import { useRouter } from "next/navigation";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

interface DashboardPageProps {
  title: string;
  children?: ReactNode;
  hideBackButton?: boolean;
  cta?: ReactNode;
}

export const DashboardPage = ({
  title,
  children,
  cta,
  hideBackButton,
}: DashboardPageProps) => {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  return (
    <section className="flex-1 h-full w-full flex flex-col">
      <div className="w-full px-6 sm:px-8 py-6 border-b border-gray-200">
        {/* Mobile layout */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Top row: back button, heading, sidebar trigger */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!hideBackButton && (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-fit bg-white"
                  variant="outline"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <Heading>{title}</Heading>
            </div>
            <Button size="icon" onClick={toggleSidebar} variant="outline">
              <MenuIcon />
            </Button>
          </div>

          {cta && <div className="w-full">{cta}</div>}
        </div>

        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-8">
            {!hideBackButton && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-fit bg-white"
                variant="outline"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <Heading>{title}</Heading>
          </div>

          <div className="flex items-center gap-4">
            {cta && <div>{cta}</div>}
            <Button size="icon" onClick={toggleSidebar} variant="outline">
              <MenuIcon />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  );
};
