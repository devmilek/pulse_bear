"use client";

import { Heading } from "@/components/heading";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const Page = () => {
  const { data: user, isPending } = authClient.useSession();
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations("Pricing");

  const { mutate: createCheckoutSession } = useMutation(
    trpc.payment.createCheckoutSession.mutationOptions({
      onSuccess: ({ url }) => {
        if (url) router.push(url);
      },
    })
  );

  const handleGetAccess = () => {
    if (user) {
      createCheckoutSession();
    } else {
      router.push("/sign-in?intent=upgrade");
    }
  };

  return (
    <div className="py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="mx-auto max-w-2xl sm:text-center">
          <Heading className="text-center">{t("heading")}</Heading>
          <p className="mt-6 text-base/7 text-muted-foreground max-w-prose text-center text-pretty">
            {t("description")}
          </p>
        </div>

        <div className="bg-card mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-primary sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-3xl font-heading font-semibold tracking-tight text-card-foreground">
              {t("plan.title")}
            </h3>

            <p className="mt-6 text-base/7 text-muted-foreground">
              {t("plan.description")}
            </p>

            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-primary">
                {t("plan.included")}
              </h4>
              <div className="h-px flex-auto bg-border" />
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-muted-foreground sm:grid-cols-2 sm:gap-6">
              {t.raw("features").map((feature: string) => (
                <li key={feature} className="flex gap-3">
                  <CheckIcon className="h-6 w-5 flex-none text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-accent py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs py-8">
                <p className="text-base font-semibold text-muted-foreground">
                  {t("plan.billing")}
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-card-foreground">
                    {t("plan.price")}
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                    {t("plan.period")}
                  </span>
                </p>

                <Button
                  onClick={handleGetAccess}
                  className="mt-6 px-20"
                  disabled={isPending}
                >
                  {t("plan.button")}
                </Button>
                <p className="mt-6 text-xs leading-5 text-muted-foreground">
                  {t("plan.trial")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default Page;
