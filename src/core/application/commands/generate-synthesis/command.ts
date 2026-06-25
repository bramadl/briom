/**
 * @description
 * Input for `GenerateSynthesisCommand`.
 */
export interface GenerateSynthesisInput {
	/**
	 * @description
	 * The participant ID whose model/perspective should synthesize.
	 */
	participantId: string;
	/**
	 * @description
	 * The room ID to synthesize.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GenerateSynthesisCommand`.
 */
export interface GenerateSynthesisOutput {
	/**
	 * @description
	 * The synthesized content (Markdown).
	 */
	content: string;

	/**
	 * @description
	 * The participant's display name who authored the synthesis.
	 */
	createdBy: string;
}

/**
 * @description
 * `GenerateSynthesisCommand` — Application Command
 *
 * Generates a synthesis of a concluded deliberation by calling the LLM.
 * This is a **blocking query** — it consumes the full stream before returning.
 *
 * **Why a Command?**
 * Despite calling an LLM, this is conceptually a read operation. It fetches
 * turns, builds a prompt, and returns a computed view of the deliberation.
 * It does not mutate room state (the caller must issue SaveSynthesisCommand
 * to persist the result).
 *
 * **Architecture Decision**
 * No SSE streaming for synthesis — the result is a document, not a live
 * experience. The FE shows a loading state, and the full synthesis is
 * revealed when complete.
 *
 * **Perspective-Dependent Synthesis**
 * Different participants (GPT, Claude, Gemini) will synthesize differently
 * based on their training. The user explicitly chooses "who" synthesizes,
 * making this a Briom-native feature.
 *
 * @see InitiateSynthesisCommand — for the guard that prevents concurrent synthesis
 * @see SaveSynthesisCommand — for persisting the result
 */
export class GenerateSynthesisCommand {
	public constructor(public readonly input: GenerateSynthesisInput) {}
}
