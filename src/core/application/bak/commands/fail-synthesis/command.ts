/**
 * @description
 * Input for `FailSynthesisCommand`.
 */
export interface FailSynthesisInput {
	/**
	 * @description
	 * The room ID to mark synthesis as failed for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `FailSynthesisCommand`.
 */
export interface FailSynthesisOutput {
	/**
	 * @description
	 * The room ID whose synthesis was marked as failed.
	 */
	roomId: string;
}

/**
 * @description
 * `FailSynthesisCommand` — Application Command
 *
 * Marks an in-flight synthesis as failed. Used when the LLM call fails
 * or times out during synthesis generation.
 *
 * **Idempotent**: Safe to call multiple times. Only mutates state if
 * synthesisStatus is currently "pending".
 */
export class FailSynthesisCommand {
	public constructor(public readonly input: FailSynthesisInput) {}
}
