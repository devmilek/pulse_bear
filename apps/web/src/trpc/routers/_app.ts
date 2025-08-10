import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { projectRouter } from "./project-router";
import { categoryRouter } from "../../modules/category/server/router";
import { paymentRouter } from "./payment-router";
import { apiKeysRouter } from "./api-keys-router";
import { projectsRouter } from "@/modules/projects/server/router";
import { speedInsightsRouter } from "@/modules/speed-insights/server/router";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  category: categoryRouter,
  payment: paymentRouter,
  apiKeys: apiKeysRouter,
  projects: projectsRouter,
  speedInsights: speedInsightsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
