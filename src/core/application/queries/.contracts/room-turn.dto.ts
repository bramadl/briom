import type { ParticipantDTO } from "@briom/app/bak";
import type { TurnIntent } from "@briom/domain";

import type { RoomAttachmentDTO } from "./room-attachment.dto";

/**
 * @description
 * A single turn within a `RoomDTO`.
 *
 * Author display info (`author.profile`) is denormalized from the
 * participants table at query time — no join required on the FE side.
 */
export interface RoomTurnDTO {
	/**
	 * @description
	 * File attachments on this turn.
	 *
	 * Only moderator turns carry attachments — participant turns always
	 * have an empty array. `textContent` is intentionally excluded from
	 * the DTO: the LLM already consumed it; the FE only needs display metadata.
	 *
	 * Empty array (not null) for consistency — callers can always safely
	 * iterate without a null check.
	 */
	attachments: RoomAttachmentDTO[];

	/**
	 * @description
	 * Turn author with embedded display profile.
	 */
	author: {
		/**
		 * @description
		 * Discriminates between human moderator and AI participant turns.
		 */
		type: "moderator" | "participant";

		/**
		 * @description
		 * Display profile for rendering the turn header.
		 * - Participant turns: `{ displayName, model }` from participants table.
		 * - Moderator turns: `null` (moderator has no display profile in MVP).
		 */
		profile: {
			/**
			 * @description
			 * Always null. Moderator needs no returned value from DTO.
			 */
			moderator: null;

			/**
			 * @description
			 * Null if this turn is from Moderator.
			 */
			participant: ParticipantDTO | null;
		};
	};

	/**
	 * @description
	 * The accumulated perspective text. Empty string while pending/streaming.
	 */
	content: string;

	/**
	 * @description
	 * ISO 8601 timestamp of creation, never null.
	 */
	createdAt: string;

	/**
	 * @description
	 * Error details when `state` is `"failed"`. Null otherwise.
	 */
	error: {
		/**
		 * @description
		 * Error classification from `STREAM_ERROR` taxonomy.
		 */
		kind: string;

		/**
		 * @description
		 * Human-readable error description.
		 */
		message: string;

		/**
		 * @description
		 * Optional error attributes (e.g. retry timing for rate limits).
		 */
		attributes: {
			/**
			 * @description
			 * Seconds to wait before retrying (for `rate_limited` errors).
			 */
			retryIn?: number;
		} | null;
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
	 * Participant intent. Null for moderator turns.
	 */
	intent: TurnIntent | null;

	/**
	 * @description
	 * ISO 8601 timestamp when turn settled, null if not settled.
	 */
	settledAt: string | null;

	/**
	 * @description
	 * Current lifecycle status of the turn.
	 * - `pending`: initiated, LLM not yet streaming
	 * - `streaming`: actively receiving tokens
	 * - `settled`: complete
	 * - `failed`: errored (may be retried)
	 * - `abandoned`: permanently dismissed
	 */
	status: "pending" | "streaming" | "settled" | "failed" | "abandoned";
}
