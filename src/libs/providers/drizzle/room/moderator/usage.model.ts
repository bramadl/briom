import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * @description
 * Tracks monthly participant turn usage per moderator.
 * Used to enforce free-tier limits (200 turns/month).
 */
export const moderatorUsageTable = pgTable("moderator_usage", {
	moderatorId: text("moderator_id").primaryKey(),
	turnCount: integer("turn_count").notNull().default(0),
	periodStart: timestamp("period_start").defaultNow().notNull(),
});

export type ModeratorUsageRecord = typeof moderatorUsageTable.$inferSelect;
