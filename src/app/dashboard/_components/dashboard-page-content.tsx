"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, BarChart2, Clock, Database, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { useTRPC } from "@/trpc/client";

export const DashboardPageContent = () => {
  const trpc = useTRPC();
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: categories } = useSuspenseQuery(
    trpc.category.getEventCategories.queryOptions()
  );

  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation(
    trpc.category.deleteCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.category.getEventCategories.infiniteQueryOptions()
        );
        setDeletingCategory(null);
      },
    })
  );

  if (!categories || categories.length === 0) {
    return <DashboardEmptyState />;
  }

  return (
    <>
      <ul className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <li
            key={category.id}
            className="relative group z-10 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="absolute z-0 inset-px rounded-lg border bg-card" />

            <div className="pointer-events-none z-0 absolute inset-px rounded-lg transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5" />

            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="size-12 rounded-full"
                  style={{
                    backgroundColor: category.color
                      ? `#${category.color.toString(16).padStart(6, "0")}`
                      : "#f3f4f6",
                  }}
                />

                <div>
                  <h3 className="text-lg/7 font-medium tracking-tight">
                    {category.emoji || "📂"} {category.name}
                  </h3>
                  <p className="text-sm/6 text-muted-foreground">
                    {format(category.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm/5 text-muted-foreground">
                  <Clock className="size-4 mr-2 text-primary" />
                  <span className="font-medium">Last ping:</span>
                  <span className="ml-1">
                    {category.lastPing
                      ? formatDistanceToNow(category.lastPing, {
                          addSuffix: true,
                        })
                      : "Never"}
                  </span>
                </div>
                <div className="flex items-center text-sm/5 text-muted-foreground">
                  <Database className="size-4 mr-2 text-primary" />
                  <span className="font-medium">Unique fields:</span>
                  <span className="ml-1">{category.uniqueFieldCount || 0}</span>
                </div>
                <div className="flex items-center text-sm/5 text-muted-foreground">
                  <BarChart2 className="size-4 mr-2 text-primary" />
                  <span className="font-medium">Events this month:</span>
                  <span className="ml-1">{category.eventsCount || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link
                  href={`/dashboard/category/${category.name}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  View all <ArrowRight className="size-4" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground size-7"
                  aria-label={`Delete ${category.name} category`}
                  onClick={() => setDeletingCategory(category.name)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        showModal={!!deletingCategory}
        setShowModal={() => setDeletingCategory(null)}
        className="max-w-md p-8"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
              Delete Category
            </h2>
            <p className="text-sm/6 text-gray-600">
              Are you sure you want to delete the category "{deletingCategory}"?
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingCategory &&
                deleteCategory({
                  name: deletingCategory,
                })
              }
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
