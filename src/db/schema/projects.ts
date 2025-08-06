import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isSpeedInsightsEnabled: boolean("is_speed_insights_enabled")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
