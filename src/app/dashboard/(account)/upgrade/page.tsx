import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { UpgradePageContent } from "./_components/upgrade-page-content";
import { getCurrentSession } from "@/lib/auth/get-current-session";

const Page = async () => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  return (
    <DashboardPage title="Pro Membership">
      <UpgradePageContent plan={dbUser.plan} />
    </DashboardPage>
  );
};

export default Page;
