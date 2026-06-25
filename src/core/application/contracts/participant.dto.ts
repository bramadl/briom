export interface ParticipantDTO {
	/**
	 * @description
	 * Unique participant identifier.
	 */
	id: string;

	/**
	 * @description
	 * The model of the AI used.
	 */
	model: string;

	/**
	 * @description
	 * Name of the participant set by the moderator.
	 */
	name: string;

	/**
	 * @description
	 * The external provider of the AI model.
	 */
	provider: string;

	/**
	 * @description
	 * Returns fully qualified model string for LLM gateway calls.
	 */
	qualifiedModel: string;
}
