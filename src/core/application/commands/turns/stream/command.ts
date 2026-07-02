/**
 * @description
 * Input data required to execute the `StreamTurn` command.
 */
export interface StreamTurnInput {
	/**
	 * @description
	 * The ID of the room where this turn is being processed and stored.
	 * Format: UUID v4.
	 */
	roomId: string;

	/**
	 * @description
	 * The ID of the turn that is being processed.
	 * Format: UUID v4.
	 */
	turnId: string;
}

/**
 * @description
 * Output data returned after the `StreamTurn` command executes successfully.
 */
export interface StreamTurnOutput {
	/**
	 * @description
	 * Placeholder output–dunno what to put just yet.
	 */
	timestamp: EpochTimeStamp;
}

/**
 * @description
 * An implicit-command that handles the turn streaming by calling the
 * LLM provider through a gateway. FE should never call this directly.
 */
export class StreamTurnCommand {
	public constructor(public readonly input: StreamTurnInput) {}
}
