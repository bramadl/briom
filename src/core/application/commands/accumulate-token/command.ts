/**
 * @description
 * Input for `AccumulateTokenCommand`.
 */
export interface AccumulateTokenInput {
	/**
	 * @description
	 * Token text to append to the turn's perspective.
	 */
	token: string;
	/**
	 * @description
	 * Turn to accumulate into.
	 */
	turnId: string;
}

/**
 * @description
 * `AccumulateTokenCommand` — Command
 *
 * Intent: Add a single token from the LLM stream to a turn.
 *
 * **High Frequency**
 * This command is called once per token during streaming. It must be fast
 * and lightweight — the handler delegates entirely to the orchestrator.
 *
 * @see AccumulateTokenHandler — for execution logic
 * @see Turn.accumulate — for domain rules
 */
export class AccumulateTokenCommand {
	public constructor(public readonly input: AccumulateTokenInput) {}
}
