import { DashboardPage } from "@/components/dashboard-page";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { ApiKeysView } from "@/modules/settings/ui/views/api-keys-view";
import { CreateApiKeyModal } from "@/modules/settings/ui/components/create-api-key-modal";

const Page = async () => {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <DashboardPage title="API Keys" cta={<CreateApiKeyModal />}>
      <ApiKeysView />
    </DashboardPage>
  );
};

export default Page;
