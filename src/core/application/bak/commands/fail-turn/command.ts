/**
 * @description
 * Error kind classification for turn failures.
 */
export type FailTurnKind =
	| "timeout"
	| "rate_limited"
	| "model_not_found"
	| "stream_failure"
	| "aborted"
	| "empty_response";

/**
 * @description
 * Input for `FailTurnCommand`.
 */
export interface FailTurnInput {
	/**
	 * @description
	 * Classification of the failure.
	 */
	kind: FailTurnKind;
	/**
	 * @description
	 * Human-readable error description.
	 */
	message?: string;
	/**
	 * @description
	 * Retry-after duration in seconds (for rate limits).
	 */
	retryAfter?: number;
	/**
	 * @description
	 * Turn to mark as failed.
	 */
	turnId: string;
}

/**
 * @description
 * `FailTurnCommand` — Command
 *
 * Intent: Mark a turn as failed due to an unrecoverable error.
 *
 * Transitions the turn from `PENDING` or `STREAMING` to `FAILED`.
 * The moderator can then choose to retry or abandon the turn.
 *
 * @see FailTurnHandler — for execution logic
 * @see Turn.fail — for domain rules
 */
export class FailTurnCommand {
	public constructor(public readonly input: FailTurnInput) {}
}
