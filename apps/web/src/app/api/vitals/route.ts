import { db } from "@/db";
import { apiKeys, projects } from "@/db/schema";
import { deviceTypes, metrics, webVitals } from "@/db/schema/web-vitals";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const schema = z.object({
  metric_name: z.enum(metrics),
  value: z.number(),
  device_type: z.enum(deviceTypes),
  url: z.url(),
  api_key: z.string(),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const data = schema.parse(body);

    const { metric_name, value, device_type, url, api_key } = data;

    const apiKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.apiKey, api_key),
    });

    if (!apiKey) {
      console.log("Invalid API key:", api_key);
      return new Response("Invalid API key", { status: 401 });
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, apiKey.projectId),
      columns: {
        id: true,
        isSpeedInsightsEnabled: true,
      },
    });

    // Check if speed insights are enabled for the project

    if (!project) {
      console.log("Speed insights not enabled for project:");
      return new Response("Speed insights are not enabled for this project", {
        status: 403,
      });
    }

    await db.insert(webVitals).values({
      deviceType: device_type,
      metric: metric_name,
      projectId: project.id,
      value,
      url,
      route: new URL(url).pathname,
    });

    console.log("Web Vital recorded:", {
      metric_name,
      value,
      url,
    });

    return NextResponse.json(
      { message: "Web Vital recorded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Web Vital:", error);
    return new Response("Invalid data", { status: 400 });
  }
};
