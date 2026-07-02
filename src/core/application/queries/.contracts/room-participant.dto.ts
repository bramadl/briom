export interface RoomParticipantDTO {
	/**
	 * @description
	 * Unique participant identifier. Required for turn authorship matching
	 * and participant-specific actions (proposals, synthesis selection).
	 */
	id: string;

	/**
	 * @description
	 * Fully qualified model string in `{provider}/{model}` format.
	 */
	model: string;

	/**
	 * @description
	 * Moderator-assigned display name.
	 */
	name: string;
}
