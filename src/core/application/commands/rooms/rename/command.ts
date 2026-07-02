/**
 * @description
 * Input data required to execute the `RenameRoom` command.
 */
export interface RenameRoomInput {
	/**
	 * @description
	 * The ID of the moderator performing this action.
	 *
	 * Used for authorization (Auth-Z) checks.
	 * Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * ID of the formed to be renamed.
	 */
	roomId: string;

	/**
	 * @description
	 * The new title for this room.
	 */
	title: string;
}

/**
 * @description
 * Output data returned after the `RenameRoom` command executes successfully.
 */
export interface RenameRoomOutput {
	/**
	 * @description
	 * The updated title upon successful process. FE can use this to invalidate query.
	 */
	title: string;
}

/**
 * @description
 * A command that allows Moderator to rename a room by specifying the title.
 */
export class RenameRoomCommand {
	public constructor(public readonly input: RenameRoomInput) {}
}
