import type { IntentOption, TurnStatusOption } from "@briom/core/domain";
import type { STREAM_ERROR } from "@briom/core/domain/turn";

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
	author: {
		/**
		 * @description
		 * Moderator ID if authorType is "moderator".
		 */

		moderatorId?: string;
		/**
		 * @description
		 * Participant ID if authorType is "participant".
		 */

		participantId?: string;
		/**
		 * @description
		 * Author type: human moderator or AI participant.
		 */
		type: "moderator" | "participant";
	};

	/**
	 * @description
	 * ISO 8601 timestamp of turn creation.
	 */
	createdAt: string;

	/**
	 * @description
	 * Error details if status is "failed", null otherwise.
	 */
	error: {
		/**
		 * @description
		 * Error classification from STREAM_ERROR taxonomy.
		 */

		kind: (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR];
		/**
		 * @description
		 * Human-readable error description.
		 */

		message: string;
		/**
		 * @description
		 * ISO 8601 timestamp of failure.
		 */

		occurredAt: string;
		/**
		 * @description
		 * Optional retry-after duration in seconds (for rate limits).
		 */
		retryAfter?: number;
	} | null;

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
	perspective: {
		/**
		 * @description
		 * Complete or accumulated text content.
		 */
		content: string;

		/**
		 * @description
		 * ISO 8601 timestamp when perspective was finalized, null if not settled.
		 */
		renderedAt: string | null;
	};

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

/**
 * @description
 * Input for `GetTurnQuery`.
 */
export interface GetTurnInput {
	/**
	 * @description
	 * The turn ID to retrieve.
	 */
	turnId: string;
}

/**
 * @description
 * Output from `GetTurnQuery`.
 */
export interface GetTurnOutput {
	/**
	 * @description
	 * The requested turn.
	 */
	turn: TurnDTO;
}

/**
 * @description
 * `GetTurnQuery` — Query Contract
 *
 * Retrieves a single turn by ID.
 * Read-only, no side effects.
 *
 * **Use Cases**
 * - Polling a specific turn's status after SSE reconnect
 * - Loading a turn detail view
 * - Verifying turn state before retry/abandon commands
 *
 * @see GetTurnHandler — for Result wrapping
 * @see DrizzleGetTurnQuery — infrastructure implementation
 */
export interface GetTurnQuery {
	/**
	 * @description
	 * Executes the query.
	 *
	 * @param input - Turn ID to look up
	 * @returns Turn data
	 * @throws Error if turn not found
	 */
	execute(input: GetTurnInput): Promise<GetTurnOutput>;
}
