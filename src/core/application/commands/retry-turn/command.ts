/**
 * @description
 * Input for `RetryTurnCommand`.
 */
export interface RetryTurnInput {
	/**
	 * @description
	 * Failed turn to retry.
	 */
	turnId: string;
}

/**
 * @description
 * Output from `RetryTurnCommand`.
 */
export interface RetryTurnOutput {
	/**
	 * @description
	 * ID of the retried turn (same as input, reset to `PENDING`).
	 */
	newTurnId: string;
}

/**
 * @description
 * `RetryTurnCommand` — Command
 *
 * Intent: Reset a failed turn to `PENDING` and re-run LLM streaming.
 *
 * The moderator's decision to retry a failed turn. Preserves the original
 * turn ID, sequence, author, and intent — only the perspective is regenerated.
 *
 * @see RetryTurnHandler — for execution logic
 * @see Turn.retry — for domain rules
 */
export class RetryTurnCommand {
	public constructor(public readonly input: RetryTurnInput) {}
}
