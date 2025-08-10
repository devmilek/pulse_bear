"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export const UpgradePageContent = () => {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: usageData } = useSuspenseQuery(
    trpc.project.getUsage.queryOptions()
  );

  return (
    <div className="max-w-3xl flex flex-col gap-8">
      <div>
        <h1 className="mt-2 text-xl/8 font-medium tracking-tight">
          {usageData.subscriptionActive ? "Plan: Pro" : "Plan: Free"}
        </h1>
        <p className="text-sm/6 text-muted-foreground max-w-prose">
          {usageData.subscriptionActive
            ? "Thank you for supporting PulseBear. Find your increased usage limits below."
            : "Get access to more events, categories and premium support."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-primary">
          <CardContent>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">
                Speed Insights Data Points
              </p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">
                {usageData?.speedInsightsUsed || 0} of{" "}
                {usageData?.speedInsightsLimit.toLocaleString() || 100}
              </p>
              <p className="text-xs/5 text-muted-foreground">
                Speed insights this period
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">Total Events</p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">
                {usageData?.eventsUsed || 0} of{" "}
                {usageData?.eventsLimit.toLocaleString() || 100}
              </p>
              <p className="text-xs/5 text-muted-foreground">
                Events this period
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">Event Categories</p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">
                {usageData.categoriesUsed || 0} of{" "}
                {usageData.categoriesLimit.toLocaleString() || 10}
              </p>
              <p className="text-xs/5 text-muted-foreground">
                Active categories
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Usage will reset{" "}
        {usageData.resetDate ? (
          format(usageData.resetDate, "MMM d, yyyy")
        ) : (
          <span className="animate-pulse w-8 h-4 bg-gray-200"></span>
        )}{" "}
        {!usageData.subscriptionActive ? (
          <span
            onClick={async () => {
              await authClient.checkout({
                products: ["200b4035-511e-43e1-a91a-867ab8979c49"],
                slug: "lifetime-access",
              });
            }}
            className="inline cursor-pointer underline text-primary"
          >
            or upgrade now to increase your limit &rarr;
          </span>
        ) : (
          <span
            onClick={async () => {
              await authClient.customer.portal();
            }}
            className="inline cursor-pointer underline text-primary"
          >
            {" "}
            Manage your subscription &rarr;
          </span>
        )}
      </p>
    </div>
  );
};
