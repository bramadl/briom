import type { IntentOption, TurnStatusOption } from "@briom/domain";

import type { TurnAuthorDTO } from "./turn-author.dto";
import type { TurnErrorDTO } from "./turn-error.dto";
import type { TurnPerspectiveDTO } from "./turn-perspective.dto";

/**
 * @description
 * `TurnDTO` Data Transfer Object.
 *
 * Flat, serializable representation of a Turn aggregate for read operations.
 * Captures the complete turn state including author, intent, perspective,
 * streaming status, and error details.
 *
 * **Why a DTO?**
 * Turn aggregates contain value objects (TurnAuthor, TurnPerspective, TurnSequence,
 * StreamError) that are not directly serializable. The DTO flattens these into
 * primitive types suitable for JSON, SSE, and caching.
 *
 * **Author Representation**
 * Author is split into discriminated fields (type, moderatorId, participantId)
 * rather than nested objects. This simplifies client-side rendering logic.
 *
 * **Perspective vs Tokens**
 * - `perspective.content` — final or current accumulated text
 * - `tokens` — always empty in DTO (streaming tokens are pushed via SSE, not polled)
 * - `perspective.renderedAt` — when perspective was finalized (null if pending/streaming)
 */
export interface TurnDTO {
	/**
	 * @description
	 * Turn author identity (discriminated union).
	 */
	author: TurnAuthorDTO;

	/**
	 * @description
	 * ISO 8601 timestamp of turn creation.
	 */
	createdAt: string;

	/**
	 * @description
	 * Error details if status is "failed", null otherwise.
	 */
	error: TurnErrorDTO | null;

	/**
	 * @description
	 * ISO 8601 timestamp of failure, null if never failed.
	 */
	failedAt: string | null;

	/**
	 * @description
	 * Unique turn identifier.
	 */
	id: string;

	/**
	 * @description
	 * Participant intent, null for moderator turns.
	 */
	intent: IntentOption | null;

	/**
	 * @description
	 * The reasoning contribution content and finalization metadata.
	 */
	perspective: TurnPerspectiveDTO;

	/**
	 * @description
	 * ID of the previous turn in sequence, null for first turn.
	 */
	previousTurnId: string | null;

	/**
	 * @description
	 * Room this turn belongs to.
	 */
	roomId: string;

	/**
	 * @description
	 * Ordinal position within the room's deliberation.
	 */
	sequence: number;

	/**
	 * @description
	 * ISO 8601 timestamp when turn settled, null if not settled.
	 */
	settledAt: string | null;

	/**
	 * @description
	 * Current lifecycle status of the turn.
	 */
	status: TurnStatusOption;

	/**
	 * @description
	 * Always empty in DTO — tokens are delivered via SSE in real time.
	 */
	tokens: string[];
}
