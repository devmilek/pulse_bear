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
    <DashboardPage title="API Key">
      <ApiKeySettings apiKey={user.apiKey ?? ""} />
    </DashboardPage>
  );
};

export default Page;
