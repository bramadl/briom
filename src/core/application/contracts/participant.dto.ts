export interface ParticipantDTO {
	/**
	 * @description
	 * An UUID assigned to the participant when first invited to a room.
	 */
	id: string;
	/**
	 * @description
	 * Unique identifier of the model.
	 *
	 * @example
	 * gpt-4, sonnet-4.5, gemini-flash
	 */
	model: string;
	/**
	 * @description
	 * Name that the moderator assigned onto upon invitation.
	 */
	name: string;
	/**
	 * @description
	 * Provider who owns the model (in lowercase).
	 *
	 * @example
	 * openai, claude, google
	 */
	provider: string;
	/**
	 * @description
	 * Concatenated name of the model in `${provider}/${model}` format.
	 *
	 * @example
	 * openai/gpt-4, claude/sonnet-4.5, google/gemini-flash
	 */
	qualifiedModel: string;
}
