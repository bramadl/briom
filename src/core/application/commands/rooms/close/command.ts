/**
 * @description
 * Input data required to execute the `CloseRoom` command.
 */
export interface CloseRoomInput {
	/**
	 * @description
	 * The ID of the moderator performing this action.
	 * Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * ID of the room to close and permanently delete.
	 * Format: UUID v4.
	 */
	roomId: string;
}

/**
 * @description
 * Output data returned after the `CloseRoom` command executes successfully.
 */
export interface CloseRoomOutput {
	/**
	 * @description
	 * The closed room's ID.
	 */
	roomId: string;
}

/**
 * @description
 * A command that allows a Moderator to permanently close and delete a room.
 * This action is irreversible.
 */
export class CloseRoomCommand {
	public constructor(public readonly input: CloseRoomInput) {}
}
