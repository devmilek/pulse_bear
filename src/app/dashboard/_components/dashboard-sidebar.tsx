import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  GaugeIcon,
  Gem,
  Home,
  Key,
  LucideIcon,
  Settings,
  TextIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { DashboardUserButton } from "./dashboard-user-button";
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher";
import { Icons } from "@/components/icons";

interface SidebarItem {
  href: string;
  icon: LucideIcon;
  text: string;
}

interface SidebarCategory {
  category: string;
  items: SidebarItem[];
}

const SIDEBAR_ITEMS: SidebarCategory[] = [
  {
    category: "Overview",
    items: [
      { href: "/dashboard", icon: Home, text: "Dashboard" },
      {
        href: "/dashboard/speed-insights",
        icon: GaugeIcon,
        text: "Speed Insights",
      },
    ],
  },
  {
    category: "Account",
    items: [{ href: "/dashboard/upgrade", icon: Gem, text: "Upgrade" }],
  },
  {
    category: "Settings",
    items: [
      { href: "/dashboard/api-key", icon: Key, text: "API Key" },
      {
        href: "/dashboard/account-settings",
        icon: Settings,
        text: "Account Settings",
      },
    ],
  },
];

export const DashboardSidebar = async () => {
  const { user } = await getCurrentSession();
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link
          href="/"
          className="flex z-40 px-2 pt-4 group-data-[collapsible=icon]:hidden"
        >
          <Icons.logo className="h-8 w-auto" />
        </Link>
        {/* <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2 group-data-[collapsible=icon]:hidden"
            >
              <Link href="/dashboard">
                <p className="sm:block text-lg/7 font-semibold text-brand-900">
                  Pulse<span className="text-brand-700">Bear</span>
                </p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
      </SidebarHeader>
      <SidebarContent>
        {SIDEBAR_ITEMS.map(({ category, items }) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel>{category}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.text}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.text}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <DashboardUserButton user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
