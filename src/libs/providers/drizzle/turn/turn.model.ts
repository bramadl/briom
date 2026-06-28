import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { authorTypeEnum, intentEnum, turnStatusEnum } from "../meta/db-enums";
import { participantsTable, roomsTable } from "../room/room.model";

/**
 * @description
 * Database schema for `Turn` aggregate persistence.
 *
 * Stores the complete turn state including author, intent, perspective,
 * status, and error details. Indexed for efficient room-scoped queries.
 *
 * **Status Values**
 * Uses PostgreSQL enum for type safety: "pending", "streaming", "settled", "failed", "abandoned"
 *
 * **Author Representation**
 * Discriminated by `authorType` with optional `moderatorId`/`participantId`:
 * - `moderator`: `authorType="moderator"`, `moderatorId` set, `participantId` null
 * - `participant`: `authorType="participant"`, `participantId` set, `moderatorId` null
 *
 * **Indexes**
 * - `turns_room_sequence_unique`: ensures monotonic sequences per room
 * - `turns_room_status_idx`: efficient filtering by room + status
 * - `turns_participant_idx`: lookup turns by participant
 * - `turns_previous_turn_idx`: chain traversal
 */
export const turnsTable = pgTable(
	"turns",
	{
		/**
		 * @description
		 * Unique turn identifier (UUID).
		 */
		id: text("id").primaryKey(),

		/**
		 * @description
		 * Parent room (foreign key with cascade delete).
		 */
		roomId: text("room_id")
			.notNull()
			.references(() => roomsTable.id, { onDelete: "cascade" }),

		/**
		 * @description
		 * Ordinal position within room's deliberation.
		 */
		sequence: integer("sequence").notNull(),

		/**
		 * @description
		 * Author type discriminator.
		 */
		authorType: authorTypeEnum("author_type").notNull(),

		/**
		 * @description
		 * Moderator ID (if authorType is "moderator").
		 */
		moderatorId: text("moderator_id"),

		/**
		 * @description
		 * Participant ID (if authorType is "participant", nullable for soft-delete).
		 */
		participantId: text("participant_id").references(
			() => participantsTable.id,
			{ onDelete: "set null" },
		),

		/**
		 * @description
		 * Participant intent (null for moderator turns).
		 */
		intent: intentEnum("intent"),

		/**
		 * @description
		 * Perspective content (empty until settled).
		 */
		content: text("content").notNull().default(""),

		/**
		 * @description
		 * File attachments for this turn, stored as a JSONB array.
		 *
		 * Only moderator turns carry attachments — participant turns always
		 * have an empty array here (enforced by the `Turn` domain invariant).
		 *
		 * Each element conforms to `AttachmentRecord`. `textContent` is NOT
		 * stored — it is fetched from Supabase Storage on demand.
		 *
		 * Default `'[]'::jsonb` — safe for existing rows before migration.
		 *
		 * Migration: `ALTER TABLE turns ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]'::jsonb;`
		 */
		attachments: jsonb("attachments")
			.$type<AttachmentRecord[]>()
			.notNull()
			.default([]),

		/**
		 * @description
		 * Current lifecycle status.
		 */
		status: turnStatusEnum("status").notNull().default("pending"),

		/**
		 * @description
		 * Previous turn ID for chain traversal (null for first turn).
		 */
		previousTurnId: text("previous_turn_id"),

		/**
		 * @description
		 * Error classification (null unless status is "failed").
		 */
		errorKind: text("error_kind"),

		/**
		 * @description
		 * Human-readable error description.
		 */
		errorMessage: text("error_message"),

		/**
		 * @description
		 * Retry-after duration in seconds (for rate limits).
		 */
		errorRetryAfter: integer("error_retry_after"),

		/**
		 * @description
		 * Timestamp of turn creation.
		 */
		createdAt: timestamp("created_at").defaultNow().notNull(),

		/**
		 * @description
		 * Timestamp when perspective was finalized (null if not settled).
		 */
		settledAt: timestamp("settled_at"),

		/**
		 * @description
		 * Timestamp when failure occurred (null if not failed).
		 */
		failedAt: timestamp("failed_at"),
	},
	(table) => [
		unique("turns_room_sequence_unique").on(table.roomId, table.sequence),
		index("turns_room_status_idx").on(table.roomId, table.status),
		index("turns_participant_idx").on(table.participantId),
		index("turns_previous_turn_idx").on(table.previousTurnId),
	],
);

/**
 * @description
 * Inferred TypeScript type for turn table rows.
 */
export type TurnRecord = typeof turnsTable.$inferSelect;

/**
 * @description
 * Serialized shape of a `TurnAttachment` as stored in the `attachments` JSONB column.
 *
 * This is NOT the domain Value Object — it's the raw DB representation.
 * `TurnMapper` converts between this and `TurnAttachment`.
 *
 * `textContent` is intentionally excluded from persistence:
 * - Text file content is fetched from Supabase Storage on demand by
 *   `TranscriptorRenderer` — storing it here would duplicate data.
 * - Image attachments use `url` (base64 data-URI) which IS stored.
 */
export interface AttachmentRecord {
	mediaType: "text" | "image";
	mimeType: string;
	name: string;
	sizeBytes: number;
	url: string;
}
