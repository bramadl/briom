/**
 * @description
 * Input for `FormRoomCommand`.
 *
 * Creates a new dedicated thinking space (`Room`) with a human moderator.
 */
export interface FormRoomInput {
	/**
	 * @description
	 * Human user who will guide this deliberation.
	 */
	moderatorId: string;
	/**
	 * @description
	 * Human-readable title for the room.
	 */
	title: string;
}

/**
 * @description
 * Output from `FormRoomCommand`.
 */
export interface FormRoomOutput {
	/**
	 * @description
	 * ID of the newly created room.
	 */
	roomId: string;
}

/**
 * @description
 * `FormRoomCommand` — Command
 *
 * Intent: Create a new `Room` aggregate in `FORMING` status.
 *
 * The first step in any deliberation. The room starts empty (no participants,
 * no topic) and awaits participant invitations.
 *
 * @see FormRoomHandler — for execution logic
 * @see Room.form — for domain factory
 */
export class FormRoomCommand {
	public constructor(public readonly input: FormRoomInput) {}
}
