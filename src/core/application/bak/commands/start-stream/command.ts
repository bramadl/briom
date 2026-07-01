/**
 * @description
 * Input for `StartStreamCommand`.
 */
export interface StartStreamInput {
	/**
	 * @description
	 * Turn to transition to streaming status.
	 */
	turnId: string;
}

/**
 * @description
 * `StartStreamCommand` — Command
 *
 * Intent: Manually trigger the `PENDING` → `STREAMING` transition.
 *
 * **Normally Automatic**
 * In the standard flow, `InitiateParticipantTurnHandler` calls this automatically
 * after LLM connection is established. This command exists for:
 * - Retry scenarios where streaming needs to restart
 * - Testing and debugging
 * - Future extensions where streaming might be deferred
 *
 * @see StartStreamHandler — for execution logic
 * @see Turn.startStream — for domain rules
 */
export class StartStreamCommand {
	public constructor(public readonly input: StartStreamInput) {}
}
