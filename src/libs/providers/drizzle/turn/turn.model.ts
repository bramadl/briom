import { index, integer, text, timestamp, unique } from "drizzle-orm/pg-core";

import { authorTypeEnum, intentEnum, turnStatusEnum } from "../meta/db-enums";
import { turnsSchema } from "../meta/db-schema";
import { participantsTable } from "../participant/participant.model";
import { roomsTable } from "../room/room.model";

export const turnsTable = turnsSchema.table(
	"turns",
	{
		id: text("id").primaryKey(),
		roomId: text("room_id")
			.notNull()
			.references(() => roomsTable.id, { onDelete: "cascade" }),
		sequenceNumber: integer("sequence_number").notNull(),
		authorType: authorTypeEnum("author_type").notNull(),
		participantId: text("participant_id").references(
			() => participantsTable.id,
			{ onDelete: "set null" },
		),
		intent: intentEnum("intent"),
		content: text("content").notNull().default(""),
		status: turnStatusEnum("status").notNull().default("settled"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		unique("turns_room_sequence_unique").on(table.roomId, table.sequenceNumber),
		index("turns_room_sequence_idx").on(table.roomId, table.sequenceNumber),
	],
);

export type TurnRecord = typeof turnsTable.$inferSelect;
