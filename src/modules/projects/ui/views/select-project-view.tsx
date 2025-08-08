"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BoxIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export const SelectProjectView = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.projects.list.queryOptions());

  return (
    <div className="grid grid-cols-4 gap-6">
      {data.map((project) => (
        <Link
          href={`/app/${project.slug}`}
          key={project.id}
          className="p-4 border rounded-lg bg-card flex items-center gap-4 hover:bg-accent"
        >
          <BoxIcon />
          <h3 className="font-semibold">{project.name}</h3>
        </Link>
      ))}
    </div>
  );
};
