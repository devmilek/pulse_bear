import { db } from "@/db";
import { apiKeys, projects } from "@/db/schema";
import { deviceTypes, metrics, webVitals } from "@/db/schema/web-vitals";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { batchSchema } from "./schema";

// ...existing code...
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const data = batchSchema.parse(body);

    const { events, projectId } = data;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      console.log("Project not found:", projectId);
      return new Response("Project not found", { status: 404 });
    }

    if (!project.isSpeedInsightsEnabled) {
      console.log("Speed insights not enabled for project:", projectId);
      return new Response("Speed insights are not enabled for this project", {
        status: 403,
      });
    }

    // Validate request origin/host against project's domain (e.g., "example.com")
    const projectDomain = project.domain
      .trim()
      .toLowerCase()
      .replace(/^\.+/, "");
    const originHeader = req.headers.get("origin") ?? undefined;
    const refererHeader = req.headers.get("referer") ?? undefined;

    const getHost = (u?: string | null) => {
      if (!u) return null;
      try {
        return new URL(u).hostname.toLowerCase();
      } catch {
        return null;
      }
    };

    const requestHost = getHost(originHeader) ?? getHost(refererHeader);

    const isHostAllowed = (host: string | null, root: string) =>
      !!host && (host === root || host.endsWith(`.${root}`));

    if (!isHostAllowed(requestHost, projectDomain)) {
      console.log("Blocked vitals: invalid origin", {
        requestHost,
        originHeader,
        refererHeader,
        expectedDomain: projectDomain,
      });
      return new Response("Forbidden: invalid origin", { status: 403 });
    }

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
