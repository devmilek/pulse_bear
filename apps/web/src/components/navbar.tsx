import Link from "next/link";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import Image from "next/image";
import { getCurrentSession } from "@/lib/auth/get-current-session";
import { SignOutButton } from "./sign-out-button";
import { Icons } from "./icons";
import { Link as I18nLink } from "@/i18n/navigation";

export const Navbar = async () => {
  const { user } = await getCurrentSession();

  return (
    <nav className="sticky z-[100] h-16 inset-x-0 top-0 w-full border-b bg-accent/80 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            <Icons.logo className="h-6" />
          </Link>

          <div className="h-full flex items-center space-x-4">
            {user ? (
              <>
                <SignOutButton asChild>
                  <Button size="sm" variant="ghost">
                    Sign out
                  </Button>
                </SignOutButton>

                <Link
                  href="/app"
                  className={buttonVariants({
                    size: "sm",
                    className: "flex items-center gap-1",
                  })}
                >
                  Dashboard <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </>
            ) : (
              <>
                <I18nLink
                  href="/pricing"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Pricing
                </I18nLink>
                <Link
                  href="/sign-in"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign in
                </Link>

                <div className="h-8 w-px bg-border" />

                <Link href="/sign-up" className={buttonVariants({})}>
                  Sign up <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
