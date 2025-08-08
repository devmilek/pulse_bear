"use client";

import { DisplayFavicon } from "@/components/display-favicon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useClickableCard from "@/hooks/use-clicable-card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { BoxIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export const SelectProjectView = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.projects.list.queryOptions());

  return (
    <div className="grid grid-cols-4 gap-6">
      {data?.map((project) => (
        <Link
          href={"/app/" + project.slug}
          key={project.id}
          className="p-4 rounded-lg border hover:bg-accent transition"
        >
          <div className="flex justify-between">
            <DisplayFavicon domain={project.domain} className="size-6" />
            <Button
              variant="ghost"
              className="size-6"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <MoreVerticalIcon />
            </Button>
          </div>
          <h2 className="text-lg font-semibold mt-4">{project.name}</h2>
          <p className="text-sm text-muted-foreground">{project.domain}</p>

          <div className="mt-2">
            <Badge variant="outline" className="gap-1.5">
              <span
                className={cn("size-1.5 rounded-full", {
                  "bg-emerald-500": project.isActive,
                  "bg-amber-500": !project.isActive,
                })}
                aria-hidden="true"
              ></span>
              {project.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
};
