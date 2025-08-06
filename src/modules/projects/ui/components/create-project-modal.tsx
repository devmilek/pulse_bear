"use client";

import ResponsiveDialog from "@/components/responsive-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createProjectSchema } from "../../schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";
import slugify from "@sindresorhus/slugify";

import { useDebounceValue } from "usehooks-ts";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectDialog = ({
  onOpenChange,
  open,
}: CreateProjectModalProps) => {
  const trpc = useTRPC();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const slug = form.watch("slug");
  const [debouncedSlug] = useDebounceValue(slug, 500); // Debounce na 500ms

  const { data: isSlugAvailable, isLoading: isCheckingSlug } = useQuery(
    trpc.projects.checkSlug.queryOptions(
      {
        slug: debouncedSlug,
      },
      {
        enabled: !!debouncedSlug && debouncedSlug.length >= 3,
      }
    )
  );
  const name = form.watch("name");

  useEffect(() => {
    form.setValue("slug", slugify(form.getValues("name")));
  }, [name]);

  const getSlugStatus = () => {
    if (!slug || slug.length < 3) return null;

    if (isCheckingSlug) {
      return {
        icon: <Loader2 className="size-4 animate-spin" />,
        text: "Checking availability...",
        className: "text-muted-foreground",
      };
    }

    if (isSlugAvailable === true) {
      return {
        icon: <CheckCircle className="size-4" />,
        text: "Slug is available",
        className: "text-green-500",
      };
    }

    if (isSlugAvailable === false) {
      return {
        icon: <X className="size-4" />,
        text: "Slug is already taken",
        className: "text-red-500",
      };
    }

    return null;
  };

  const slugStatus = getSlugStatus();

  const { mutate } = useMutation(trpc.projects.create.mutationOptions());

  const onSubmit = (data: z.infer<typeof createProjectSchema>) => {
    mutate(
      {
        name: data.name,
        slug: data.slug,
      },
      {
        onSuccess: ({ slug }) => {
          form.reset();
          router.push(`/app/${slug}`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(
            error.message || "Failed to create project. Please try again."
          );
        },
      }
    );
  };

  return (
    <ResponsiveDialog
      title="Create new project"
      description="Create a new project to start tracking your performance."
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="My awesome project" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="slug"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="my-awesome-project" />
                </FormControl>
                <FormMessage />
                {slugStatus && (
                  <div
                    className={cn(
                      "text-sm flex items-center gap-2",
                      slugStatus.className
                    )}
                  >
                    {slugStatus.icon}
                    <span>{slugStatus.text}</span>
                  </div>
                )}
                {slug && slug.length > 0 && slug.length < 3 && (
                  <div className="text-sm text-muted-foreground">
                    Slug must be at least 3 characters long
                  </div>
                )}
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isCheckingSlug || isSlugAvailable === false}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
