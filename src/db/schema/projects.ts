import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import cuid from "cuid";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug"),
    isSpeedInsightsEnabled: boolean("is_speed_insights_enabled")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("projects_user_slug_idx").on(table.userId, table.slug),
    index("projects_userid_idx").on(table.userId),
  ]
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 100 }).notNull(),

    apiKey: text("api_key")
      .notNull()
      .unique()
      .$default(() => `sk_${cuid()}`),

    isActive: boolean("is_active").notNull().default(true),
    revokedAt: timestamp("revoked_at"),
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex().on(t.projectId, t.name),
    uniqueIndex().on(t.apiKey),
    index().on(t.projectId, t.isActive),
  ]
);
