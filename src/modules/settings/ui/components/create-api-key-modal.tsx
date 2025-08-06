"use client";

import { Modal } from "@/components/modal";
import ResponsiveDialog from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useProjectData } from "@/modules/projects/hooks/use-project-data";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const CreateApiKeyModal = () => {
  const [open, setOpen] = React.useState(false);
  const trpc = useTRPC();
  const project = useProjectData();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate, isPending } = useMutation(
    trpc.apiKeys.createApiKey.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.apiKeys.getApiKeys.queryOptions({
            projectId: project.id,
          })
        );
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating API key:", error);
        toast.error(error.message || "Failed to create API key");
      },
    })
  );

  const onSubmit = (data: z.infer<typeof schema>) => {
    mutate({
      ...data,
      projectId: project.id,
    });
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          form.reset();
        }}
      >
        Create API Key
      </Button>
      <ResponsiveDialog
        title="Create API Key"
        description="Generate a new API key for your application."
        open={open}
        onOpenChange={(val) => setOpen(val)}
      >
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your API Key name"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="animate-spin" />}
              Create
            </Button>
          </form>
        </Form>
      </ResponsiveDialog>
    </>
  );
};
