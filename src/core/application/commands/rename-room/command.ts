/**
 * @description
 * Input for `RenameRoomCommand`.
 */
export interface RenameRoomInput {
	/**
	 * @description
	 * New title for the room.
	 */
	newTitle: string;
	/**
	 * @description
	 * Room to rename.
	 */
	roomId: string;
}

/**
 * @description
 * `RenameRoomCommand` — Command
 *
 * Intent: Change the human-readable title of a room.
 *
 * Does not affect deliberation status or participants. Purely cosmetic.
 *
 * @see RenameRoomHandler — for execution logic
 * @see Room.rename — for domain rules
 */
export class RenameRoomCommand {
	public constructor(public readonly input: RenameRoomInput) {}
}
