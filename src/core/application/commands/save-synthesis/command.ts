/**
 * @description
 * Input for `SaveSynthesisCommand`.
 */
export interface SaveSynthesisInput {
	/**
	 * @description
	 * The synthesized content (Markdown).
	 */
	content: string;

	/**
	 * @description
	 * Display name of the participant that generated the synthesis.
	 */
	createdBy: string;

	/**
	 * @description
	 * The room ID to save synthesis for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `SaveSynthesisCommand`.
 */
export interface SaveSynthesisOutput {
	/**
	 * @description
	 * The room ID that synthesis was saved for.
	 */
	roomId: string;
}

/**
 * @description
 * `SaveSynthesisCommand` — Application Command
 *
 * Persists a completed synthesis to the room. Called by the FE (or background
 * process) after the LLM has finished generating the synthesis content.
 *
 * **Precondition**: Room must have synthesisStatus === "pending"
 * (set by InitiateSynthesisCommand).
 *
 * **Why a Command?**
 * This mutates room state (synthesis content + status + timestamps).
 * It cannot be a query because it persists state.
 */
export class SaveSynthesisCommand {
	public constructor(public readonly input: SaveSynthesisInput) {}
}
