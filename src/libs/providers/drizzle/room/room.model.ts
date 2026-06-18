import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { roomStatusEnum } from "../schema";

/**
 * @description
 * Database schema for `Room` aggregate persistence.
 *
 * Stores the root `Room` data. Participants and turns are stored in separate
 * tables with foreign keys to enable efficient querying and cascading deletes.
 *
 * **Cascade Behavior**
 * Deleting a room cascades to participants and turns (via ON DELETE CASCADE)
 */
export const roomsTable = pgTable(
	"rooms",
	{
		/**
		 * @description
		 * Unique room identifier (UUID).
		 */
		id: text("id").primaryKey(),

		/**
		 * @description
		 * Human-readable room title.
		 */
		title: text("title").notNull(),

		/**
		 * @description
		 * Human moderator who guides this deliberation.
		 */
		moderatorId: text("moderator_id").notNull(),

		/**
		 * @description
		 * Current lifecycle status.
		 */
		status: roomStatusEnum("status").notNull().default("forming"),

		/**
		 * @description
		 * Deliberation topic (null until deliberation starts).
		 */
		topic: text("topic"),

		/**
		 * @description
		 * Timestamp of room creation.
		 */
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("rooms_moderator_id_idx").on(table.moderatorId)],
);

/**
 * @description
 * Inferred TypeScript type for room table rows.
 */
export type RoomRecord = typeof roomsTable.$inferSelect;

/**
 * @description
 * Database schema for `Participant` entity persistence.
 *
 * Participants belong to exactly one room. Deleting a room cascades
 * to delete all its participants.
 */
export const participantsTable = pgTable(
	"participants",
	{
		/**
		 * @description
		 * Unique participant identifier (UUID).
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
		 * LLM provider identifier (e.g., "openai", "anthropic").
		 */
		provider: text("provider").notNull(),

		/**
		 * @description
		 * AI model identifier (e.g., "gpt-4", "claude-3.5-sonnet").
		 */
		model: text("model").notNull(),

		/**
		 * @description
		 * Human-readable name within the room.
		 */
		displayName: text("display_name").notNull(),
	},
	(table) => [index("participants_room_id_idx").on(table.roomId)],
);

/**
 * @description
 * Inferred TypeScript type for participant table rows.
 */
export type ParticipantRecord = typeof participantsTable.$inferSelect;
