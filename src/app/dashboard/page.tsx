import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { DashboardPageContent } from "./_components/dashboard-page-content";

const Page = async () => {
  const auth = await currentUser();

  if (!auth) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.externalId, auth.id),
  });

  if (!user) {
    redirect("/sign-up");
  }

  return (
    <DashboardPage title="Dashboard">
      <DashboardPageContent />
    </DashboardPage>
  );
};

export default Page;
