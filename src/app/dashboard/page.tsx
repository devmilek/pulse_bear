import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { DashboardPageContent } from "./_components/dashboard-page-content";
import { createCheckoutSession } from "@/lib/stripe";
import { CreateEventCategoryModal } from "@/components/create-event-category-modal";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PaymentSuccessModal } from "@/components/payment-success-modal";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const currSearchParams = await searchParams;
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

  const intent = currSearchParams.intent;

  if (intent === "upgrade") {
    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user.id,
    });

    if (session.url) redirect(session.url);
  }

  const success = currSearchParams.success;

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
