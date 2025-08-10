import { deviceTypes, metrics } from "@/db/schema";
import z from "zod";

const attributionSchema = z.object({
  connection: z
    .object({
      effectiveType: z.string(),
      downlink: z.number(),
      rtt: z.number(),
      saveData: z.boolean(),
    })
    .partial()
    .optional(),
  deviceMemory: z.number().optional(),
  hardwareConcurrency: z.number().optional(),
  dpr: z.number().optional(),
  locale: z.string().optional(),
  viewport: z
    .object({
      w: z.number(),
      h: z.number(),
    })
    .optional(),
  page: z.object({
    url: z.url(),
    path: z.string(),
  }),
});

const eventSchema = z.object({
  type: z.literal("web-vital"),
  metric: z.object({
    name: z.enum(metrics),
    value: z.number(),
    id: z.string(),
  }),
  timestamp: z.number().int(),
  deviceType: z.enum(deviceTypes),
  attribution: attributionSchema.optional(),
});

export const batchSchema = z.object({
  projectId: z.string(),
  events: z.array(eventSchema).min(1),
});
