/**
 * @description
 * Input for `InviteParticipantCommand`.
 */
export interface InviteParticipantInput {
	/**
	 * @description
	 * Human-readable name for this participant in the room.
	 */
	displayName: string;
	/**
	 * @description
	 * AI model identifier (e.g., "gpt-4", "claude-3.5-sonnet").
	 */
	model: string;
	/**
	 * @description
	 * Model provider (e.g., "openai", "anthropic").
	 */
	provider: string;
	/**
	 * @description
	 * Room to invite into.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `InviteParticipantCommand`.
 */
export interface InviteParticipantOutput {
	/**
	 * @description
	 * ID of the newly invited participant.
	 */
	participantId: string;
}

/**
 * @description
 * `InviteParticipantCommand` — Command
 *
 * Intent: Add an AI participant to a room that is still FORMING.
 *
 * **MVP Constraint**
 * Participants cannot be invited after deliberation starts. The room's
 * participant roster is frozen once deliberation begins to preserve
 * shared context integrity.
 *
 * @see InviteParticipantHandler — for execution logic
 * @see Room.inviteParticipant — for domain invariant
 */
export class InviteParticipantCommand {
	public constructor(public readonly input: InviteParticipantInput) {}
}
