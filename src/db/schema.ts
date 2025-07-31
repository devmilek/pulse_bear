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

const plans = ["FREE", "PRO"] as const;
export type Plan = (typeof plans)[number];
export const planEnum = pgEnum("plan", plans);

export const deliveryStatusEnum = pgEnum("deliverystatus", [
  "PENDING",
  "DELIVERED",
  "FAILED",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  discordId: text("discord_id").unique(),
  // apiKey: text("api_key")
  //   .unique()
  //   .$default(() => cuid()),
  plan: planEnum("plan").default("FREE").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

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

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: uuid("userId").references(() => users.id),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

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
      .references(() => users.id, {
        onDelete: "cascade",
      }),

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

    action: text("action").notNull(),
    description: text("description"),
    eventUserId: varchar("event_user_id", { length: 100 }), // user specified in the event

    fields: jsonb("fields").notNull().$type<Record<string, any>>(),
    deliveryStatus: deliveryStatusEnum("delivery_status")
      .default("PENDING")
      .notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }), // owner of the event

    eventCategoryId: uuid("event_category_id").references(
      () => eventCategories.id,
      {
        onDelete: "cascade",
      }
    ),

    // USER AGENT
    os: varchar("os", { length: 50 }),
    browser: varchar("browser", { length: 50 }),
    device: varchar("device", { length: 50 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("events_created_at_idx").on(table.createdAt)]
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
