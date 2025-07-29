import { DashboardPage } from "@/components/dashboard-page";
import { redirect } from "next/navigation";
import React from "react";
import { DashboardPageContent } from "./_components/dashboard-page-content";
import { CreateEventCategoryModal } from "@/components/create-event-category-modal";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PaymentSuccessModal } from "@/components/payment-success-modal";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { SearchParams } from "nuqs";
import { prefetch, trpc } from "@/trpc/server";
import { auth } from "@/lib/auth";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: PageProps) => {
  const currSearchParams = await searchParams;
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  const intent = currSearchParams.intent;

  if (intent === "upgrade") {
    const session = await auth.api.checkout({
      body: {
        products: [process.env.NEXT_PUBLIC_PRO_PRODUCT_ID!],
      },
    });

    if (session.url) redirect(session.url);
  }

  const success = currSearchParams.success;

  prefetch(trpc.category.getEventCategories.queryOptions());

  return (
    <>
      {success ? <PaymentSuccessModal /> : null}
      <DashboardPage
        title="Dashboard"
        hideBackButton
        cta={
          <CreateEventCategoryModal>
            <Button className="w-full sm:w-fit">
              <PlusIcon className="size-4 mr-2" />
              Add Category
            </Button>
          </CreateEventCategoryModal>
        }
      >
        <DashboardPageContent />
      </DashboardPage>
    </>
  );
};

export default Page;
