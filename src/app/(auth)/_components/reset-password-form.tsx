"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await authClient.resetPassword(
      {
        newPassword: data.newPassword,
        token,
      },
      {
        onSuccess: () => {
          router.push("/sign-in");
        },
        onError: ({ error }) => {
          console.error("Sign up error:", error);
          setError(
            error.message ||
              "An unexpected error occurred. Please try again later."
          );
        },
      }
    );
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="mt-6 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} type="password" />
              </FormControl>
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading && <Spinner className="animate-spin" />}
          Reset Password
        </Button>
      </form>
    </Form>
  );
};
