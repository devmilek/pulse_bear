import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AccountSettings } from "./_components/setttings-page-content";
import { getCurrentSession } from "@/lib/auth/get-current-session";

const Page = async () => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <DashboardPage title="Account Settings">
      <AccountSettings discordId={user.discordId ?? ""} />
    </DashboardPage>
  );
};

export default Page;
