import type {
	IntentOption,
	RoomStatusOption,
	TurnStatusOption,
} from "@briom/domain";

/**
 * @description
 * `RoomDeliberationDTO` — Full deliberation view for the room page.
 *
 * A single denormalized payload that replaces the previous two-query pattern
 * (`getRoom` + `getTurns`). All data needed to render the deliberation page —
 * participants, turns (with embedded author display info), synthesis, and
 * room metadata — is returned in one round-trip.
 *
 * **Design decisions**
 *
 * `turns` are embedded here rather than kept as a separate cache entry.
 * This eliminates the FE join between `turn.author.participantId` and
 * `room.participants` entirely. The SSE patching layer targets this single
 * cache key for all real-time updates.
 *
 * `participants` use a flat shape identical to `RoomOverviewDTO` — no
 * separate `ParticipantDTO` type is needed.
 *
 * `synthesis` is either `null` (none/pending/failed) or a populated object
 * (completed). FE checks `synthesisStatus` to distinguish pending/failed.
 *
 * `info` groups read-only room metadata that changes rarely and is never
 * patched by SSE — keeps it out of the hot-path fields.
 */
export interface RoomDeliberationDTO {
	/**
	 * @description
	 * Full room UUID.
	 */
	id: string;

	/**
	 * @description
	 * Read-only room metadata. Never patched by SSE.
	 */
	info: {
		/**
		 * @description
		 * First 8 characters of the room UUID for display (e.g. "#a1b2c3d4").
		 */
		shortId: string;

		/**
		 * @description
		 * ISO 8601 timestamp of room formation.
		 */
		formedAt: string;

		/**
		 * @description
		 * Moderator (human user) identifier.
		 */
		moderatorId: string;
	};

	/**
	 * @description
	 * Invited AI participants. Updated by SSE on `room:participant-joined`.
	 * Ordered by invite sequence.
	 */
	participants: Array<RoomDeliberationParticipantDTO>;

	/**
	 * @description
	 * Current lifecycle status. Updated by SSE on `room:deliberation-*` events.
	 */
	status: RoomStatusOption;

	/**
	 * @description
	 * Synthesis state. Null when no synthesis has been completed.
	 * `synthesisStatus` indicates whether synthesis is in progress or failed.
	 */
	synthesis: RoomDeliberationSynthesisDTO | null;

	/**
	 * @description
	 * Current synthesis process status.
	 */
	synthesisStatus: "idle" | "pending" | "completed" | "failed";

	/**
	 * @description
	 * Human-readable room title.
	 */
	title: string;

	/**
	 * @description
	 * Deliberation topic. Null until deliberation starts.
	 * Updated by SSE on `room:deliberation-started`.
	 */
	topic: string | null;

	/**
	 * @description
	 * All turns in the room, ordered by sequence ascending.
	 * Updated in real-time by SSE (`turn:initiated`, `turn:token`,
	 * `turn:settled`, `turn:failed`, `turn:started`).
	 *
	 * Author display info is embedded per turn — FE never needs to look up
	 * `participants` by ID to render a turn header.
	 */
	turns: Array<RoomDeliberationTurnDTO>;
}

/**
 * @description
 * A single turn within a `RoomDeliberationDTO`.
 *
 * Author display info (`author.profile`) is denormalized from the
 * participants table at query time — no join required on the FE side.
 */
export interface RoomDeliberationTurnDTO {
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
			 * Participant ID if `author.type` is "participant".
			 */
			id: string;

			/**
			 * @description
			 * Moderator-assigned display name (e.g. "Claude", "GPT-4").
			 */
			displayName: string;

			/**
			 * @description
			 * Fully qualified model string (e.g. "anthropic/claude-3.5-sonnet").
			 */
			model: string;
		} | null;
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
	intent: IntentOption | null;

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
	status: TurnStatusOption;
}

/**
 * @description
 * Completed synthesis document within a `RoomDeliberationDTO`.
 *
 * Only present when `synthesisStatus === "completed"`.
 */
export interface RoomDeliberationSynthesisDTO {
	/**
	 * @description
	 * The generated synthesis content (Markdown).
	 */
	content: string;

	/**
	 * @description
	 * ISO 8601 timestamp of synthesis creation.
	 */
	createdAt: string;

	/**
	 * @description
	 * Display name of the participant who generated this synthesis.
	 */
	createdBy: string;
}

export interface RoomDeliberationParticipantDTO {
	/**
	 * @description
	 * Unique participant identifier. Required for turn authorship matching
	 * and participant-specific actions (proposals, synthesis selection).
	 */
	id: string;

	/**
	 * @description
	 * Fully qualified model string in `{provider}/{model}` format.
	 */
	model: string;

	/**
	 * @description
	 * Moderator-assigned display name.
	 */
	name: string;
}
