/**
 * @description
 * Input data required to execute the `InviteParticipant` command.
 */
export interface InviteParticipantInput {
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
	 * The ID of the moderator performing this action.
	 * Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * The model provider (e.g., "openai", "anthropic").
	 */
	provider: string;

	/**
	 * @description
	 * ID of the room to invite the participant into.
	 * Format: UUID v4.
	 */
	roomId: string;
}

/**
 * @description
 * Output data returned after the `InviteParticipant` command executes successfully.
 */
export interface InviteParticipantOutput {
	/**
	 * @description
	 * Display name of the invited participant.
	 */
	displayName: string;

	/**
	 * @description
	 * ID of the newly invited participant.
	 */
	participantId: string;

	/**
	 * @description
	 * Qualified model string of the invited participant.
	 */
	qualifiedModel: string;
}

/**
 * @description
 * A command that allows a Moderator to invite a new AI participant
 * into an existing room. Only possible while the room is in FORMING status.
 */
export class InviteParticipantCommand {
	public constructor(public readonly input: InviteParticipantInput) {}
}
