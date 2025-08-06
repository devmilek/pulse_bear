import { DashboardPage } from "@/components/dashboard-page";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { redirect } from "next/navigation";
import React from "react";

const AllowedOriginsPage = async () => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardPage title="Allowed Origins"></DashboardPage>;
};

export default AllowedOriginsPage;
