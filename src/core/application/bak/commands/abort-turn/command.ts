/**
 * @description
 * Input for `AbortTurnCommand`.
 */
export interface AbortTurnInput {
	/**
	 * @description
	 * The actively streaming turn to abort.
	 */
	turnId: string;
}

/**
 * @description
 * `AbortTurnCommand` — Command
 *
 * Intent: Interrupt a streaming turn mid-flight by moderator decision.
 *
 * Unlike `AbandonTurnCommand` (which operates on FAILED turns), this command
 * targets turns in STREAMING (or PENDING) status. It signals the in-flight
 * LLM stream to cancel, then transitions the turn to FAILED with
 * `StreamError.aborted()`. The moderator may subsequently retry or abandon.
 *
 * @see AbortTurnHandler — for execution logic
 * @see TurnStreamingService.abort — for the signal registry lookup
 * @see Turn.fail — for domain rules (allows PENDING | STREAMING → FAILED)
 */
export class AbortTurnCommand {
	public constructor(public readonly input: AbortTurnInput) {}
}
