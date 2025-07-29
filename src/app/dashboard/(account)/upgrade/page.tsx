import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { UpgradePageContent } from "./_components/upgrade-page-content";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

const Page = async () => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  prefetch(trpc.project.getUsage.queryOptions());

  return (
    <DashboardPage title="Pro Membership">
      <HydrateClient>
        <UpgradePageContent />
      </HydrateClient>
    </DashboardPage>
  );
};

export default Page;
