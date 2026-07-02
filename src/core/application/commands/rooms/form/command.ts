/**
 * @description
 * Input data required to execute the `FormRoom` command.
 */
export interface FormRoomInput {
	/**
	 * @description
	 * The ID of the moderator performing this action.
	 * Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * Initial participants to invite.
	 * At minimum, specificy at least one participant.
	 */
	participants: {
		/**
		 * @description
		 * Human-readable name shown in the room.
		 * e.g. "Claude", "GPT-4o".
		 */
		displayName: string;

		/**
		 * @description
		 * The AI model identifier (e.g., "gpt-4", "claude-3.5-sonnet").
		 */
		model: string;

		/**
		 * @description
		 * The model provider (e.g., "openai", "anthropic").
		 */
		provider: string;
	}[];

	/**
	 * @description
	 * Title of the room given by the Moderator.
	 */
	title: string;
}

/**
 * @description
 * Output data returned after the `FormRoom` command executes successfully.
 */
export interface FormRoomOutput {
	/**
	 * @description
	 * ID of the formed room. FE can use this to make route redirection.
	 */
	roomId: string;

	/**
	 * @description
	 * Toast message for participants that were skipped (invalid/duplicate).
	 * FE should show this as a non-blocking warning when present.
	 */
	warning?: string;
}

/**
 * @description
 * A command that allows Moderator to form a room by specifying the title
 * and the initial participants to be invited along with forming process.
 */
export class FormRoomCommand {
	public constructor(public readonly input: FormRoomInput) {}
}
