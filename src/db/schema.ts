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
  boolean,
} from "drizzle-orm/pg-core";

import cuid from "cuid";
import { relations } from "drizzle-orm";
import { users } from "./schema/users";

export const deliveryStatusEnum = pgEnum("deliverystatus", [
  "PENDING",
  "DELIVERED",
  "FAILED",
]);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

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
    uniqueIndex().on(t.userId, t.name),
    uniqueIndex().on(t.apiKey),
    index().on(t.userId, t.isActive),
  ]
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
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
      .references(() => users.id, {
        onDelete: "cascade",
      }),

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

export const allowedOrigins = pgTable(
  "allowed_origins",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Najprościej: globalnie dla użytkownika.
    // Jeśli kiedyś zechcesz per-klucz, dodasz apiKeyId (nullable) i unikalność skorygujesz.
    domain: varchar("domain", { length: 255 }).notNull(), // np. "asteriostudio.com" | "localhost"
    includeSubdomains: boolean("include_subdomains").notNull().default(false),

    isEnabled: boolean("is_enabled").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("allowed_origins_user_domain_sub_idx").on(
      t.userId,
      t.domain,
      t.includeSubdomains
    ),
    index("allowed_origins_user_idx").on(t.userId),
    index("allowed_origins_domain_idx").on(t.domain),
  ]
);

export const allowedOriginsRelations = relations(allowedOrigins, ({ one }) => ({
  user: one(users, { fields: [allowedOrigins.userId], references: [users.id] }),
}));
