import { text } from "drizzle-orm/pg-core";

import { participantsSchema } from "../meta/db-schema";
import { roomsTable } from "../room/room.model";

export const participantsTable = participantsSchema.table("participants", {
	id: text("id").primaryKey(),
	roomId: text("room_id")
		.notNull()
		.references(() => roomsTable.id, { onDelete: "cascade" }),
	provider: text("provider").notNull(),
	model: text("model").notNull(),
	displayName: text("display_name").notNull(),
});

export type ParticipantRecord = typeof participantsTable.$inferSelect;
