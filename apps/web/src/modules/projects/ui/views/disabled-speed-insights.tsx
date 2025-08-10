"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useProjectData } from "../../hooks/use-project-data";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useRouter } from "next/navigation";

export const DisabledSpeedInsights = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const project = useProjectData();
  const { mutate, isPending } = useMutation(
    trpc.speedInsights.enableSpeedInsights.mutationOptions({
      onSuccess: () => {
        router.refresh();
      },
    })
  );
  return (
    <div className="absolute top-0 left-0 flex items-center justify-center right-0 bg-white/60 backdrop-blur-xs h-full">
      <div className="bg-background rounded-lg border max-w-md p-6 shadow-xl z-20">
        <h2 className="text-lg font-semibold">Enable Speed Insights</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Measure your real page performance
        </p>
        <Separator className="my-4" />
        <p className="text-sm text-muted-foreground">
          Get insight into the loading speed, responsiveness, visual stability,
          and other metrics that contribute to a great end-user experience for
          your site or application.
        </p>
        <Separator className="my-4" />
        <div className="flex justify-end">
          <Button
            disabled={isPending}
            onClick={() => {
              mutate({ projectId: project.id });
            }}
          >
            {isPending && <Spinner className="animate-spin" />}
            Enable
          </Button>
        </div>
      </div>
    </div>
  );
};
