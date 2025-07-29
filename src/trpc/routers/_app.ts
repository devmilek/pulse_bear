import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { projectRouter } from "./project-router";
import { categoryRouter } from "./category-router";
import { paymentRouter } from "./payment-router";
import { apiKeysRouter } from "./api-keys-router";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  category: categoryRouter,
  payment: paymentRouter,
  apiKeys: apiKeysRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
