import { db } from "@/db";
import { deviceTypes, Metric, metrics, projects, webVitals } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, eq, gte, sql } from "drizzle-orm";
import z from "zod";
import { percentiles, TimeRange, timeRanges } from "../constants";
import { subDays, subHours } from "date-fns";
import { fillTimeGapsTZ } from "./fill-time-gaps-tz";

function getWindow(period: TimeRange) {
  const now = new Date();
  const ms =
    period === "24h"
      ? 24 * 60 * 60 * 1000
      : period === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : period === "30d"
          ? 30 * 24 * 60 * 60 * 1000
          : 90 * 24 * 60 * 60 * 1000;
  const start = new Date(now.getTime() - ms);
  const bucket = period === "24h" ? "hour" : ("day" as const);
  return { start, bucket };
}

const percentileToValue = {
  p50: 0.5,
  p75: 0.75,
  p90: 0.9,
} as const;

function generateTimeBuckets(start: Date, end: Date, bucket: "hour" | "day") {
  const buckets: Date[] = [];
  const current = new Date(start);

  if (bucket === "hour") {
    current.setMinutes(0, 0, 0);
    while (current <= end) {
      buckets.push(new Date(current));
      current.setHours(current.getHours() + 1);
    }
  } else {
    current.setHours(0, 0, 0, 0);
    while (current <= end) {
      buckets.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  return buckets;
}

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

export const speedInsightsRouter = createTRPCRouter({
  enableSpeedInsights: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;
      const { user } = ctx;
      try {
        await db
          .update(projects)
          .set({ isSpeedInsightsEnabled: true })
          .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
        return { success: true };
      } catch (error) {
        console.error("Error enabling speed insights:", error);
        throw new Error("Failed to enable speed insights");
      }
    }),
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

          console.log(metric, result);

          const count = Number(result?.count ?? 0);

          metricResults[metric] = {
            value: count === 0 ? null : (result?.value ?? 0),
            count,
          };
        }

        return {
          stats: [
            {
              metric: "FCP" as Metric,
              value:
                metricResults.FCP?.value === undefined
                  ? null
                  : metricResults.FCP.value,
              count: metricResults.FCP?.count || 0,
            },
            {
              metric: "LCP" as Metric,
              value:
                metricResults.LCP?.value === undefined
                  ? null
                  : metricResults.LCP.value,
              count: metricResults.LCP?.count || 0,
            },
            {
              metric: "INP" as Metric,
              value:
                metricResults.INP?.value === undefined
                  ? null
                  : metricResults.INP.value,
              count: metricResults.INP?.count || 0,
            },
            {
              metric: "CLS" as Metric,
              value:
                metricResults.CLS?.value === undefined
                  ? null
                  : metricResults.CLS.value,
              count: metricResults.CLS?.count || 0,
            },
            {
              metric: "TTFB" as Metric,
              value:
                metricResults.TTFB?.value === undefined
                  ? null
                  : metricResults.TTFB.value,
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
  getMetricChartData: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        metric: z.enum(metrics),
        period: z.enum(timeRanges),
        deviceType: z.enum(deviceTypes),
        percentile: z.enum(percentiles),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, metric, period, deviceType, percentile } = input;
      try {
        const { start, bucket } = getWindow(period);
        const p = percentileToValue[percentile];

        // date_trunc with timezone('Europe/Warsaw', ...) for bucketing by local time
        const bucketExpr = sql<Date>`
(
  date_trunc(${sql.raw(`'${bucket}'`)}, ${webVitals.createdAt} AT TIME ZONE 'Europe/Warsaw')
  AT TIME ZONE 'Europe/Warsaw'
)
`.as("bucket");

        const pctlExpr = sql<number>`
        percentile_cont(${p}) within group (order by ${webVitals.value})
      `.as("pctl");

        const countExpr = sql<number>`count(*)`.as("cnt");

        const rows = await db
          .select({
            date: bucketExpr,
            value: pctlExpr,
            count: countExpr,
          })
          .from(webVitals)
          .where(
            and(
              eq(webVitals.projectId, projectId),
              eq(webVitals.metric, metric),
              eq(webVitals.deviceType, deviceType),
              gte(webVitals.createdAt, start)
            )
          )
          .groupBy(bucketExpr)
          .orderBy(bucketExpr);

        // Koniec okna – teraz; jeśli chcesz: przytnij do początku aktualnej godziny/dnia
        const end = new Date(); // ewentualnie oblicz ze swojego getWindow(period)

        const unit = bucket === "hour" ? "hour" : "day";

        const filled = fillTimeGapsTZ(
          rows.map((r) => ({
            date: r.date,
            value: r.value ?? null,
            count: Number(r.count),
          })),
          start,
          end,
          unit,
          "Europe/Warsaw"
        );

        return filled;
      } catch (error) {
        console.error("Error fetching metric chart data:", error);
        throw new Error("Failed to fetch metric chart data");
      }
    }),
  getRoutesData: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(timeRanges),
        deviceType: z.enum(deviceTypes),
        percentile: z.enum(percentiles),
        metric: z.enum(metrics),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, period, deviceType, percentile, metric } = input;
      const percentileValue = percentileToValue[percentile];
      const rows = await db
        .select({
          route: webVitals.route,
          value:
            sql`percentile_cont(${percentileValue}) WITHIN GROUP (ORDER BY value)`.as<number>(),
          count: count(),
        })
        .from(webVitals)
        .where(
          and(
            eq(webVitals.projectId, projectId),
            eq(webVitals.deviceType, deviceType),
            eq(webVitals.metric, metric),
            gte(webVitals.createdAt, getPeriodDate(period))
          )
        )
        .groupBy(webVitals.route)
        .limit(10);

      return rows;
    }),
});
