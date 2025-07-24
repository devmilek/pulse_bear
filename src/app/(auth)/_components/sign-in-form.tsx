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
  password: z.string().min(1, "Password is required"),
});

export const SignInForm = () => {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");

  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push(intent ? `/dashboard?intent=${intent}` : "/dashboard");
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

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-title text-sm">Password</FormLabel>
                <Button asChild variant="link" size="sm" className="px-0">
                  <Link href="/forgot-password" className="link text-xs px-0">
                    Forgot your Password?
                  </Link>
                </Button>
              </div>
              <FormControl>
                <Input {...field} type="password" disabled={isLoading} />
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
          Sign In
        </Button>
      </form>
    </Form>
  );
};
