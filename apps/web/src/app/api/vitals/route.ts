import { db } from "@/db";
import { apiKeys, projects, quotas, subscription } from "@/db/schema";
import { deviceTypes, metrics, webVitals } from "@/db/schema/web-vitals";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { batchSchema } from "./schema";
import { isSubscriptionActive } from "@/lib/utils";
import { FREE_QUOTA, PRO_QUOTA } from "@/config";

const getHost = (u?: string | null) => {
  if (!u) return null;
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return null;
  }
};

const toRootDomain = (host: string | null) => {
  if (!host) return null;
  if (host === "localhost" || /^[\d.]+$/.test(host)) return host; // localhost/IP
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  return parts.slice(-2).join("."); // prosty fallback; dla złożonych TLD rozważ PSL
};
const isHostAllowed = (host: string | null, root: string) =>
  !!host && (host === root || host.endsWith(`.${root}`));

async function checkQuota(userId: string): Promise<boolean> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const quota = await db.query.quotas.findFirst({
    where: and(
      eq(quotas.userId, userId),
      eq(quotas.month, currentMonth),
      eq(quotas.year, currentYear),
      eq(quotas.kind, "SPEED_INSIGHTS")
    ),
  });

  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  const limit = isSubscriptionActive(sub)
    ? PRO_QUOTA.maxSpeedInsightsDataPoints
    : FREE_QUOTA.maxSpeedInsightsDataPoints;

  return !quota || quota.count < limit;
}

async function incrementQuota(userId: string) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await db
    .insert(quotas)
    .values({
      userId,
      month: currentMonth,
      year: currentYear,
      count: 1,
      kind: "SPEED_INSIGHTS",
    })
    .onConflictDoUpdate({
      target: [quotas.userId, quotas.month, quotas.year, quotas.kind],
      set: {
        count: sql`${quotas.count} + 1`,
      },
    });
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    // console.log("Received Web Vital data:", JSON.stringify(body, null, 2));
    const data = batchSchema.parse(body);
    const { events, projectId } = data;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    const allowed = await checkQuota(project.userId);

    if (!allowed) {
      return new Response("Monthly quota reached. Please upgrade your plan.", {
        status: 429,
      });
    }

    const originHeader = req.headers.get("origin") ?? undefined;
    const refererHeader = req.headers.get("referer") ?? undefined;
    const requestHost = getHost(originHeader) ?? getHost(refererHeader);
    const requestRoot = toRootDomain(requestHost);

    if (!requestRoot) {
      return new Response("Forbidden: missing or invalid origin", {
        status: 403,
      });
    }

    if (!project.isSpeedInsightsEnabled) {
      return new Response("Speed insights are not enabled for this project", {
        status: 403,
      });
    }

    if (projectId !== project.id) {
      return new Response("Forbidden: project ID mismatch", { status: 403 });
    }

    // Validate request origin/host against project's domain (e.g., "example.com")
    const projectDomain = project.domain
      .trim()
      .toLowerCase()
      .replace(/^\.+/, "");

    // ...existing code...
    // check if its valid project domain
    // const validDomain = new URL(project.domain).hostname;
    // Insert only events that match the project's domain (by attribution.page.url)
    let inserted = 0;
    for (const event of events) {
      const { metric, deviceType, attribution } = event;

      // If attribution has a page URL, enforce host match to project domain
      if (attribution?.page?.url) {
        const pageHost = getHost(attribution.page.url);
        if (!isHostAllowed(pageHost, projectDomain)) {
          console.log("Skipped event due to page host mismatch", {
            pageHost,
            expectedDomain: projectDomain,
          });
          continue;
        }
      }

      await db.insert(webVitals).values({
        deviceType: deviceType,
        metric: metric.name,
        projectId: project.id,
        value: metric.value,
        url: attribution?.page.url || "",
        route: attribution?.page.path || "",
      });

      // console.log("Inserted Web Vital event:", {
      //   projectId: project.id,
      //   metric: metric.name,
      //   value: metric.value,
      // });

      await incrementQuota(project.userId);

      inserted++;
    }

    return NextResponse.json(
      { message: "Web Vitals recorded successfully", inserted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Web Vital:", error);
    return new Response("Invalid data", { status: 400 });
  }
};
// ...existing code...
