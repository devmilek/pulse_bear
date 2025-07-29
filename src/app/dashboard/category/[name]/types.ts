import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type GetEventsByCategoryName =
  inferRouterOutputs<AppRouter>["category"]["getEventsByCategoryName"];
