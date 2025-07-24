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
  jsonb,
} from "drizzle-orm/pg-core";

import cuid from "cuid";
import { relations } from "drizzle-orm";

const plans = ["FREE", "PRO"] as const;
export type Plan = (typeof plans)[number];
export const planEnum = pgEnum("plan", plans);

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

export const usersRelations = relations(users, ({ many }) => ({
  eventCategories: many(eventCategories),
  events: many(events),
  quotas: many(quotas),
}));

// Tabela: event_categories
export const eventCategories = pgTable(
  "event_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    color: integer("color").notNull(),
    emoji: varchar("emoji", { length: 16 }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    uniqueNamePerUser: uniqueIndex("event_categories_name_userid_idx").on(
      table.name,
      table.userId
    ),
  })
);

export type EventCategory = typeof eventCategories.$inferSelect;

export const eventCategoriesRelations = relations(
  eventCategories,
  ({ many, one }) => ({
    events: many(events),
    user: one(users, {
      fields: [eventCategories.userId],
      references: [users.id],
    }),
  })
);

// Tabela: events
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formattedMessage: text("formatted_message").notNull(),
    name: varchar("name", { length: 100 }).notNull(),

    fields: jsonb("fields").notNull().$type<Record<string, any>>(),
    deliveryStatus: deliveryStatusEnum("delivery_status")
      .default("PENDING")
      .notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    eventCategoryId: uuid("event_category_id").references(
      () => eventCategories.id
    ),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    createdAtIdx: index("events_created_at_idx").on(table.createdAt),
  })
);

export type Event = typeof events.$inferSelect;

export const eventsRelations = relations(events, ({ one }) => ({
  category: one(eventCategories, {
    fields: [events.eventCategoryId],
    references: [eventCategories.id],
  }),
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

// Tabela: quotas
export const quotas = pgTable(
  "quotas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    year: integer("year").notNull(),
    month: integer("month").notNull(),
    count: integer("count").notNull().default(0),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Unique constraint na kombinację userId, year, month
    uniqueUserMonthYear: uniqueIndex("quotas_user_month_year_idx").on(
      table.userId,
      table.year,
      table.month
    ),
  })
);

export const quotasRelations = relations(quotas, ({ one }) => ({
  user: one(users, {
    fields: [quotas.userId],
    references: [users.id],
  }),
}));
