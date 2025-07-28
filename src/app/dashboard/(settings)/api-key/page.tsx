import { DashboardPage } from "@/components/dashboard-page";
import { redirect } from "next/navigation";
import { ApiKeySettings } from "./api-key-settings";
import { getCurrentSession } from "@/lib/auth/get-current-session";

const Page = async () => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <DashboardPage title="API Keys" cta="Create API Key">
      <ApiKeySettings />
    </DashboardPage>
  );
};

export default Page;
