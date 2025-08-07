import { db } from "@/db";
import { deviceTypes, Metric, metrics, webVitals } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, gte, sql } from "drizzle-orm";
import z from "zod";
import { percentiles, TimeRange, timeRanges } from "../constants";
import { subDays, subHours } from "date-fns";

const getPeriodDate = (period: TimeRange) => {
  const now = new Date();
  switch (period) {
    case "24h":
      return subHours(now, 24);
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "90d":
      return subDays(now, 90);
    default:
      return subDays(now, 30);
  }
};

// ...existing code...
export const speedInsightsRouter = createTRPCRouter({
  getMetricsStats: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(timeRanges),
        deviceType: z.enum(deviceTypes),
        percentile: z.enum(percentiles),
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
        const metricResults: Record<
          string,
          { value: number | null; count: number }
        > = {};
        const periodDate = getPeriodDate(period);

        for (const metric of metrics) {
          const [result] = await db
            .select({
              value: getPercentileSQL(percentileValue),
              count: sql`count(*)`.as<number>("count"),
            })
            .from(webVitals)
            .where(
              and(
                eq(webVitals.projectId, projectId),
                eq(webVitals.metric, metric),
                eq(webVitals.deviceType, input.deviceType),
                gte(webVitals.createdAt, periodDate)
              )
            );

          metricResults[metric] = {
            value: result?.value || null,
            count: result?.count || 0,
          };
        }

        return {
          stats: [
            {
              metric: "FCP" as Metric,
              value: metricResults.FCP?.value || null,
              count: metricResults.FCP?.count || 0,
            },
            {
              metric: "LCP" as Metric,
              value: metricResults.LCP?.value || null,
              count: metricResults.LCP?.count || 0,
            },
            {
              metric: "INP" as Metric,
              value: metricResults.INP?.value || null,
              count: metricResults.INP?.count || 0,
            },
            {
              metric: "CLS" as Metric,
              value: metricResults.CLS?.value || null,
              count: metricResults.CLS?.count || 0,
            },
            {
              metric: "TTFB" as Metric,
              value: metricResults.TTFB?.value || null,
              count: metricResults.TTFB?.count || 0,
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
// ...existing code...
