/**
 * @description
 * Input data required to execute the `UninviteParticipant` command.
 */
export interface UninviteParticipantInput {
	/**
	 * @description
	 * The ID of the moderator performing this action.
	 * Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * ID of the participant to uninvite.
	 * Format: UUID v4.
	 */
	participantId: string;

	/**
	 * @description
	 * ID of the room to uninvite the participant from.
	 * Format: UUID v4.
	 */
	roomId: string;
}

/**
 * @description
 * Output data returned after the `UninviteParticipant` command executes successfully.
 */
export interface UninviteParticipantOutput {
	/**
	 * @description
	 * ID of the uninvited participant.
	 */
	participantId: string;
}

/**
 * @description
 * A command that allows a Moderator to remove an AI participant
 * from a room. Only possible while the room is in FORMING status.
 */
export class UninviteParticipantCommand {
	public constructor(public readonly input: UninviteParticipantInput) {}
}
