import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const deliveryStatusEnum = pgEnum("deliverystatus", [
  "PENDING",
  "DELIVERED",
  "FAILED",
]);

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
  (table) => [
    uniqueIndex("event_categories_name_userid_idx").on(
      table.name,
      table.userId
    ),
  ]
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
