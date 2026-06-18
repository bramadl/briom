/**
 * @description
 * Input for `SettleTurnCommand`.
 */
export interface SettleTurnInput {
	/**
	 * @description
	 * Complete final perspective content.
	 */
	content: string;
	/**
	 * @description
	 * Turn to settle.
	 */
	turnId: string;
}

/**
 * @description
 * `SettleTurnCommand` — Command
 *
 * Intent: Finalize a turn after streaming completes.
 *
 * Transitions the turn from `STREAMING` to `SETTLED`, making the perspective
 * available as shared context for subsequent turns.
 *
 * @see SettleTurnHandler — for execution logic
 * @see Turn.settle — for domain rules
 */
export class SettleTurnCommand {
	public constructor(public readonly input: SettleTurnInput) {}
}
