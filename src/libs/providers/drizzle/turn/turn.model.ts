import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { authorTypeEnum, intentEnum, turnStatusEnum } from "../meta/db-enums";
import { participantsTable } from "../participant/participant.model";
import { roomsTable } from "../room/room.model";

export const turnsTable = pgTable(
	"turns",
	{
		id: text("id").primaryKey(),
		roomId: text("room_id")
			.notNull()
			.references(() => roomsTable.id, { onDelete: "cascade" }),
		sequence: integer("sequence").notNull(),
		authorType: authorTypeEnum("author_type").notNull(),
		moderatorId: text("moderator_id"),
		participantId: text("participant_id").references(
			() => participantsTable.id,
			{ onDelete: "set null" },
		),
		intent: intentEnum("intent"),
		content: text("content").notNull().default(""),
		status: turnStatusEnum("status").notNull().default("pending"),
		previousTurnId: text("previous_turn_id"),
		errorKind: text("error_kind"),
		errorMessage: text("error_message"),
		errorRetryAfter: integer("error_retry_after"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		settledAt: timestamp("settled_at"),
		failedAt: timestamp("failed_at"),
	},
	(table) => [
		unique("turns_room_sequence_unique").on(table.roomId, table.sequence),
		index("turns_room_status_idx").on(table.roomId, table.status),
		index("turns_participant_idx").on(table.participantId),
		index("turns_previous_turn_idx").on(table.previousTurnId),
	],
);

export type TurnRecord = typeof turnsTable.$inferSelect;
