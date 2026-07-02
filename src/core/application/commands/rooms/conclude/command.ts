/**
 * @description
 * Input data required to execute the `ConcludeRoom` command.
 */
export interface ConcludeRoomInput {
	/**
	 * @description
	 * The ID of the moderator performing this action.
	 * Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * ID of the room to conclude.
	 * Format: UUID v4.
	 */
	roomId: string;
}

/**
 * @description
 * Output data returned after the `ConcludeRoom` command executes successfully.
 */
export interface ConcludeRoomOutput {
	/**
	 * @description
	 * The concluded room's ID.
	 */
	roomId: string;

	/**
	 * @description
	 * The room's status after conclusion.
	 */
	status: string;
}

/**
 * @description
 * A command that allows a Moderator to conclude an active deliberation,
 * making the room permanently read-only.
 */
export class ConcludeRoomCommand {
	public constructor(public readonly input: ConcludeRoomInput) {}
}
