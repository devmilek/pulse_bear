import { useSearchParams } from "next/navigation";
import { SocialLogin } from "../_components/social-login";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { SignInForm } from "../_components/sign-in-form";

const Page = () => {
  return (
    // <div className="w-full flex-1 flex items-center justify-center">
    //   <SignIn
    //     forceRedirectUrl={intent ? `/dashboard?intent=${intent}` : "/dashboard"}
    //   />
    // </div>
    <div className="w-full flex-1 flex items-center justify-center">
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <Icons.logotype className="size-6" />
            </Link>
            <h1 className="text-title font-heading mb-1 mt-4 text-2xl font-semibold">
              Sign in to PulseBear
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Sign in to continue
            </p>
          </div>

          <SignInForm />

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              Or continue With
            </span>
            <hr className="border-dashed" />
          </div>

          <SocialLogin />
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Dont have an account?
            <Button asChild variant="link" className="px-2">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
