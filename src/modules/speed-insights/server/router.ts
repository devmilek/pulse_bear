import { db } from "@/db";
import { deviceTypes, Metric, metrics, webVitals } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

// ...existing code...
export const speedInsightsRouter = createTRPCRouter({
  getMetricsStats: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(["24h", "7d", "30d", "90d"]),
        deviceType: z.enum(deviceTypes),
        percentile: z.enum(["p50", "p75"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, period, deviceType, percentile } = input;

      try {
        const getPercentileSQL = (percentileValue: number) => {
          return sql`percentile_cont(${percentileValue}) within group (order by "value")`.as<number>(
            "value"
          );
        };

        const percentileValue = percentile === "p50" ? 0.5 : 0.75;
        const metricResults: Record<string, number | null> = {};

        for (const metric of metrics) {
          const [result] = await db
            .select({
              value: getPercentileSQL(percentileValue),
            })
            .from(webVitals)
            .where(
              and(
                eq(webVitals.projectId, projectId),
                eq(webVitals.metric, metric),
                eq(webVitals.deviceType, input.deviceType)
              )
            );

          metricResults[metric] = result?.value || null;
        }

        return {
          stats: [
            {
              metric: "FCP" as Metric,
              value: metricResults.FCP || null,
            },
            {
              metric: "LCP" as Metric,
              value: metricResults.LCP || null,
            },
            {
              metric: "INP" as Metric,
              value: metricResults.INP || null,
            },
            {
              metric: "CLS" as Metric,
              value: metricResults.CLS || null,
            },
            {
              metric: "TTFB" as Metric,
              value: metricResults.TTFB || null,
            },
          ],
          deviceType,
          percentile,
        };
      } catch (error) {
        console.error("Error fetching metrics stats:", error);
        throw new Error("Failed to fetch metrics stats");
      }
    }),
});
// ...existing code...
