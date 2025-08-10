import { SocialLogin } from "../_components/social-login";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { ForgotPasswordForm } from "../_components/forgot-password-form";
import { SearchParams } from "nuqs";
import { ResetPasswordForm } from "../_components/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: ResetPasswordPageProps) => {
  const currSearchParams = await searchParams;

  const token = currSearchParams.token;

  if (!token || typeof token !== "string" || token.trim() === "") {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
            <div className="text-center">
              <Icons.logotype className="size-6" />
              <h1 className="text-title font-heading mb-2 mt-4 text-2xl font-semibold">
                Invalid Reset Token
              </h1>
              <p className="text-sm text-muted-foreground">
                The reset token is missing or invalid.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <Icons.logotype className="size-6" />
            </Link>
            <h1 className="text-title font-heading mb-2 mt-4 text-2xl font-semibold">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter a new password below to reset your password.
            </p>
          </div>

          <ResetPasswordForm token={token} />
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button asChild variant="link" className="px-2">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
