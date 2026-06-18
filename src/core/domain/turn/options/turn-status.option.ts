/**
 * @description
 * Turn status lifecycle states.
 *
 * Represents the progression of a single contribution from initiation through
 * streaming to final settlement (or failure). The state machine is enforced by
 * the `Turn` aggregate's domain methods.
 *
 * @see Turn — for state transition rules and invariant enforcement
 */
export const TURN_STATUS_OPTION = {
	/**
	 * @description
	 * `Turn` initiated, awaiting LLM stream start.
	 */
	PENDING: "pending",
	/**
	 * @description
	 * Actively receiving tokens from LLM.
	 */
	STREAMING: "streaming",
	/**
	 * @description
	 * Stream complete, perspective finalized.
	 */
	SETTLED: "settled",
	/**
	 * @description
	 * Stream encountered unrecoverable error.
	 */
	FAILED: "failed",
	/**
	 * @description
	 * Failed turn permanently abandoned by moderator.
	 */
	ABANDONED: "abandoned",
} as const;

export type TurnStatusOption =
	(typeof TURN_STATUS_OPTION)[keyof typeof TURN_STATUS_OPTION];
