"use client";

import { authClient } from "@/lib/auth/auth-client";
import React, { ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
  children?: ReactNode;
  asChild?: boolean;
}

export const SignOutButton = ({
  children,
  asChild = false,
}: SignOutButtonProps) => {
  const router = useRouter();
  const onClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  const Comp = asChild ? Slot : "button";

  return <Comp onClick={onClick}>{children || "Sign Out"}</Comp>;
};
