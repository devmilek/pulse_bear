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

const schema = z.object({
  email: z.email("Invalid email address"),
});

export const ForgotPasswordForm = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await authClient.requestPasswordReset(
      {
        email: data.email,
        redirectTo: "/reset-password",
      },
      {
        onSuccess: () => {
          setSuccess(true);
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
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} type="email" />
              </FormControl>
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>
              If an account with that email exists, a password reset link has
              been sent to your email address.
            </AlertDescription>
          </Alert>
        )}

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading && <Spinner className="animate-spin" />}
          Send Reset Link
        </Button>
      </form>
    </Form>
  );
};
