import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { projectRouter } from "./project-router";
import { categoryRouter } from "./category-router";
import { paymentRouter } from "./payment-router";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  category: categoryRouter,
  payment: paymentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
