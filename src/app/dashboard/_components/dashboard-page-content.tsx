"use client";

import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const DashboardPageContent = () => {
  const { data: categories, isPending: isEventCategoriesLoading } = useQuery({
    queryKey: ["user-event-categories"],
    queryFn: async () => {
      const res = await client.category.getEventCategories.$get();
      const { categories } = await res.json();
      return categories;
    },
  });
  return <div>DashboardPageContent</div>;
};
