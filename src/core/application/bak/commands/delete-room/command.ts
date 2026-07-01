/**
 * @description
 * Input for `DeleteRoomCommand`.
 */
export interface DeleteRoomInput {
	/**
	 * @description
	 * Room to delete.
	 */
	roomId: string;
}

/**
 * @description
 * `DeleteRoomCommand` — Command
 *
 * Intent: Permanently remove a room and all its data.
 *
 * **Hard Delete**
 * This is a destructive operation. All turns, participants, and room state
 * are removed from persistence. No events are published — the room simply ceases to exist.
 *
 * @see DeleteRoomHandler — for execution logic
 */
export class DeleteRoomCommand {
	public constructor(public readonly input: DeleteRoomInput) {}
}
