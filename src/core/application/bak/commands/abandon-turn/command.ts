/**
 * @description
 * Input for `AbandonTurnCommand`.
 */
export interface AbandonTurnInput {
	/**
	 * @description
	 * Failed turn to abandon.
	 */
	turnId: string;
}

/**
 * @description
 * `AbandonTurnCommand` — Command
 *
 * Intent: Permanently retire a failed turn.
 *
 * The moderator's decision to give up on a failed turn. Once abandoned,
 * no further action is possible — the turn is terminal.
 *
 * @see AbandonTurnHandler — for execution logic
 * @see Turn.abandon — for domain rules
 */
export class AbandonTurnCommand {
	public constructor(public readonly input: AbandonTurnInput) {}
}
