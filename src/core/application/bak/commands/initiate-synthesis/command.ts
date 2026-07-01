/**
 * @description
 * Input for `InitiateSynthesisCommand`.
 */
export interface InitiateSynthesisInput {
	/**
	 * @description
	 * The room ID to initiate synthesis for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `InitiateSynthesisCommand`.
 */
export interface InitiateSynthesisOutput {
	/**
	 * @description
	 * The room ID that synthesis was initiated for.
	 */
	roomId: string;
}

/**
 * @description
 * `InitiateSynthesisCommand` — Application Command
 *
 * Flags a room as "synthesizing" to prevent duplicate synthesis requests.
 * Idempotent guard — if synthesis is already in progress, returns an error.
 *
 * **Why a Command?**
 * This mutates room state (synthesisStatus: idle → pending). It's not a query
 * because it has side effects and guards against concurrent synthesis.
 *
 * **Flow**
 * 1. Load room by ID
 * 2. Call room.initiateSynthesis() (domain guard)
 * 3. Persist room
 * 4. Publish domain events
 *
 * @see SaveSynthesisCommand — for completing the synthesis
 * @see FailSynthesisCommand — for marking synthesis as failed
 */
export class InitiateSynthesisCommand {
	public constructor(public readonly input: InitiateSynthesisInput) {}
}
