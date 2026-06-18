import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roomsTable = pgTable("rooms", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	moderatorId: text("moderator_id").notNull(),
	status: text("status").notNull().default("forming"),
	topic: text("topic"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RoomRecord = typeof roomsTable.$inferSelect;

export const participantsTable = pgTable("participants", {
	id: text("id").primaryKey(),
	roomId: text("room_id")
		.notNull()
		.references(() => roomsTable.id, { onDelete: "cascade" }),
	provider: text("provider").notNull(),
	model: text("model").notNull(),
	displayName: text("display_name").notNull(),
});

export type ParticipantRecord = typeof participantsTable.$inferSelect;
