import { DashboardPage } from "@/components/dashboard-page";
import { redirect } from "next/navigation";
import React from "react";
import { DashboardPageContent } from "../_components/dashboard-page-content";
import { CreateEventCategoryModal } from "@/components/create-event-category-modal";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PaymentSuccessModal } from "@/components/payment-success-modal";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { SearchParams } from "nuqs";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Project } from "@/db/schema";
import { loadProjectOrRedirect } from "@/lib/project-loader";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const { user, project } = await loadProjectOrRedirect(slug);

  if (!user) {
    redirect("/sign-in");
  }

  prefetch(
    trpc.category.getEventCategories.queryOptions({
      projectId: project.id,
    })
  );

  return (
    <>
      <HydrateClient>
        <DashboardPage
          title="Events"
          hideBackButton
          // cta={
          //   <CreateEventCategoryModal>
          //     <Button className="w-full sm:w-fit">
          //       <PlusIcon className="size-4 mr-2" />
          //       Add Category
          //     </Button>
          //   </CreateEventCategoryModal>
          // }
        >
          <DashboardPageContent />
        </DashboardPage>
      </HydrateClient>
    </>
  );
};

export default Page;
