import {
	INTENT_OPTION,
	type IntentOption,
	ROOM_STATUS_OPTION,
	type RoomStatusOption,
	TURN_STATUS_OPTION,
	type TurnStatusOption,
} from "@briom/core/domain";
import { pgEnum } from "drizzle-orm/pg-core";

/**
 * @description
 * PostgreSQL enum for turn author types.
 *
 * Discriminates between human moderator and AI participant contributions.
 */
export const authorTypeEnum = pgEnum("author_type", [
	"moderator",
	"participant",
]);

/**
 * @description
 * PostgreSQL enum for participant intents.
 *
 * Enforces valid intent values at the database level.
 * Synchronized with domain `INTENT_OPTION`.
 */
export const intentEnum = pgEnum(
	"intent",
	Object.values(INTENT_OPTION) as [IntentOption, ...IntentOption[]],
);

/**
 * @description
 * PostgreSQL enum for turn status lifecycle.
 *
 * Enforces valid status values at the database level.
 * Synchronized with domain `TURN_STATUS_OPTION`.
 */
export const turnStatusEnum = pgEnum(
	"turn_status",
	Object.values(TURN_STATUS_OPTION) as [
		TurnStatusOption,
		...TurnStatusOption[],
	],
);

/**
 * @description
 * PostgreSQL enum for room status lifecycle.
 *
 * Enforces valid status values at the database level.
 * Synchronized with domain `ROOM_STATUS_OPTION`.
 */
export const roomStatusEnum = pgEnum(
	"room_status",
	Object.values(ROOM_STATUS_OPTION) as [
		RoomStatusOption,
		...RoomStatusOption[],
	],
);

/**
 * @description
 * PostgreSQL enum for room synthesizing process.
 */
export const roomSynthesisEnum = pgEnum("room_synthesis_status", [
	"idle",
	"pending",
	"completed",
	"failed",
]);
