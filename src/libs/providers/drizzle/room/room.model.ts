import { text, timestamp } from "drizzle-orm/pg-core";

import { roomsSchema } from "../meta/db-schema";

export const roomsTable = roomsSchema.table("rooms", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RoomRecord = typeof roomsTable.$inferSelect;
