"use client";

import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, MenuIcon } from "lucide-react";
import { Heading } from "./heading";
import { useRouter } from "next/navigation";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardPageProps {
  children?: ReactNode;
  items?: {
    href?: string;
    label: string;
  }[];
  rightActions?: ReactNode;
}

const ITEMS_TO_DISPLAY = 3;

export const DashboardPage = ({
  children,
  items,
  rightActions,
}: DashboardPageProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  return (
    <section className="flex-1 h-full w-full flex flex-col">
      {/* <div className="w-full px-6 sm:px-8 py-6 border-b">
        <div className="flex flex-col gap-4 sm:hidden">
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
                className="w-fit"
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
      </div> */}

      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {items && (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={items[0]?.href ?? "/"}>{items[0]?.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {items.length > ITEMS_TO_DISPLAY ? (
                  <>
                    <BreadcrumbItem>
                      {isDesktop ? (
                        <DropdownMenu open={open} onOpenChange={setOpen}>
                          <DropdownMenuTrigger
                            className="flex items-center gap-1"
                            aria-label="Toggle menu"
                          >
                            <BreadcrumbEllipsis className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {items.slice(1, -2).map((item, index) => (
                              <DropdownMenuItem key={index}>
                                <Link href={item.href ? item.href : "#"}>
                                  {item.label}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Drawer open={open} onOpenChange={setOpen}>
                          <DrawerTrigger aria-label="Toggle Menu">
                            <BreadcrumbEllipsis className="h-4 w-4" />
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader className="text-left">
                              <DrawerTitle>Navigate to</DrawerTitle>
                              <DrawerDescription>
                                Select a page to navigate to.
                              </DrawerDescription>
                            </DrawerHeader>
                            <div className="grid gap-1 px-4">
                              {items.slice(1, -2).map((item, index) => (
                                <Link
                                  key={index}
                                  href={item.href ? item.href : "#"}
                                  className="py-1 text-sm"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                            <DrawerFooter className="pt-4">
                              <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      )}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                ) : null}
                {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
                  <BreadcrumbItem key={index}>
                    {item.href ? (
                      <>
                        <BreadcrumbLink
                          asChild
                          className="max-w-20 truncate md:max-w-none"
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    ) : (
                      <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {/* <h1 className="text-base font-medium">Documents</h1> */}
          <div className="ml-auto flex items-center gap-2">
            {rightActions}
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="hidden sm:flex"
            >
              <a
                href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground"
              >
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto relative">
        {children}
      </div>
    </section>
  );
};
