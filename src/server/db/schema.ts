import {
  pgTable,
  varchar,
  integer,
  timestamp,
  json,
  pgEnum,
  uniqueIndex,
  index,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import cuid from "cuid";

// Enums
export const planEnum = pgEnum("plan", ["FREE", "PRO"]);
export const deliveryStatusEnum = pgEnum("deliverystatus", [
  "PENDING",
  "DELIVERED",
  "FAILED",
]);

// Tabela: users
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalId: varchar("external_id", { length: 64 }).unique().default(""),

    quotaLimit: integer("quota_limit").notNull(),
    plan: planEnum("plan").default("FREE").notNull(),

    email: varchar("email", { length: 255 }).unique().notNull(),
    apiKey: varchar("api_key", { length: 64 })
      .unique()
      .$defaultFn(() => cuid())
      .notNull(),
    discordId: varchar("discord_id", { length: 64 }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailApiKeyIdx: index("users_email_apikey_idx").on(
      table.email,
      table.apiKey
    ),
  })
);

// Tabela: event_categories
export const eventCategories = pgTable(
  "event_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    color: integer("color").notNull(),
    emoji: varchar("emoji", { length: 16 }),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueNamePerUser: uniqueIndex("event_categories_name_userid_idx").on(
      table.name,
      table.userId
    ),
  })
);

// Tabela: events
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formattedMessage: text("formatted_message").notNull(),
    name: varchar("name", { length: 100 }).notNull(),

    fields: json("fields").notNull(),
    deliveryStatus: deliveryStatusEnum("delivery_status")
      .default("PENDING")
      .notNull(),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    eventCategoryId: varchar("event_category_id", { length: 36 }).references(
      () => eventCategories.id
    ),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    createdAtIdx: index("events_created_at_idx").on(table.createdAt),
  })
);

// Tabela: quotas
export const quotas = pgTable("quotas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => users.id),

  year: integer("year").notNull(),
  month: integer("month").notNull(),
  count: integer("count").notNull().default(0),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
