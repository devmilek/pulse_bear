import { pgEnum, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const metrics = ["CLS", "FCP", "LCP", "TTFB", "INP"] as const;
export type Metric = (typeof metrics)[number];
export const metricEnum = pgEnum("metric", metrics);

export const deviceTypes = ["mobile", "desktop"] as const;
export type DeviceType = (typeof deviceTypes)[number];
export const deviceTypeEnum = pgEnum("device_type", deviceTypes);

export const webVitals = pgTable("web_vitals", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, {
      onDelete: "cascade",
    }),
  metric: metricEnum("metric").notNull(),
  deviceType: deviceTypeEnum("device_type").notNull(),
  value: real().notNull(),
  route: text().notNull(),
  url: text().notNull(),
});
