/**
 * @description
 * Input data required to execute the `GenerateCheckpoint` command.
 */
export interface GenerateCheckpointInput {
	/**
	 * @description
	 * The ID of the room a checkpoint is being generated for.
	 * Format: UUID v4.
	 */
	roomId: string;
}

/**
 * @description
 * Output data returned after the `GenerateCheckpoint` command executes successfully.
 */
export interface GenerateCheckpointOutput {
	/**
	 * @description
	 * ID of the newly attached checkpoint, or null if there was
	 * nothing new to summarize (no settled turns since the last checkpoint).
	 */
	checkpointId: string | null;

	/**
	 * @description
	 * True if this checkpoint caused the room to freeze — always true
	 * for a non-power-user moderator on a successful generation.
	 */
	roomFrozen: boolean;

	/**
	 * @description
	 * The room this checkpoint belongs to.
	 */
	roomId: string;
}

/**
 * @description
 * An implicit-command that compresses a Room's deliberation history
 * (since the last checkpoint) into a new Checkpoint, and attaches it
 * to the Room. Enqueued by `ExecuteParticipantTurnHandler` whenever
 * `CheckpointTriggerPolicy` decides accumulated usage warrants it —
 * FE should never call this directly.
 *
 * Also enforces the Free-tier policy: once a non-power-user moderator's
 * room produces a checkpoint, the room is frozen — a self-resolvable
 * lock the moderator lifts by topping up Briom Credit.
 */
export class GenerateCheckpointCommand {
	public constructor(public readonly input: GenerateCheckpointInput) {}
}
