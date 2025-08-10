import { db } from "@/db";
import { apiKeys, projects } from "@/db/schema";
import { deviceTypes, metrics, webVitals } from "@/db/schema/web-vitals";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { batchSchema } from "./schema";

const normalizeDomain = (d: string) =>
  d.trim().toLowerCase().replace(/^\.+/, "");
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

// ...existing code...
export const POST = async (req: NextRequest) => {
  try {
    const originHeader = req.headers.get("origin") ?? undefined;
    const refererHeader = req.headers.get("referer") ?? undefined;
    const requestHost = getHost(originHeader) ?? getHost(refererHeader);
    const requestRoot = toRootDomain(requestHost);

    if (!requestRoot) {
      return new Response("Forbidden: missing or invalid origin", {
        status: 403,
      });
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.domain, normalizeDomain(requestRoot)),
    });

    if (!project) {
      console.log("Blocked vitals: no project for domain", { requestRoot });
      return new Response("Forbidden: domain not allowed", { status: 403 });
    }

    if (!project.isSpeedInsightsEnabled) {
      return new Response("Speed insights are not enabled for this project", {
        status: 403,
      });
    }

    const body = await req.json();

    const data = batchSchema.parse(body);

    const { events, projectId } = data;

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
