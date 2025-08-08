"use client";

import * as React from "react";
import { ArrowUpRight, BoxIcon, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CreateProjectDialog } from "@/modules/projects/ui/components/create-project-modal";
import { Project } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashboardProjectSwitcher({
  currentProject,
}: {
  currentProject?: Project;
}) {
  const { isMobile } = useSidebar();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const trpc = useTRPC();
  const router = useRouter();
  const { data } = useQuery(trpc.projects.list.queryOptions());

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BoxIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentProject?.name || "Select a project"}
                  </span>
                  {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Projects
              </DropdownMenuLabel>
              {data?.map((project, index) => (
                <DropdownMenuItem
                  key={project.name}
                  onClick={() => router.push(`/app/${project.slug}`)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <BoxIcon className="size-3.5 shrink-0" />
                  </div>
                  {project.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Create new project
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-2" asChild>
                <Link href="/app">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <ArrowUpRight className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    View all projects
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateProjectDialog onOpenChange={setIsModalOpen} open={isModalOpen} />
    </>
  );
}
