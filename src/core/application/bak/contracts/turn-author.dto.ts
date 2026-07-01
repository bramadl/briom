export interface TurnAuthorDTO {
	/**
	 * @description
	 * Moderator ID if authorType is "moderator".
	 */

	moderatorId?: string;
	/**
	 * @description
	 * Participant ID if authorType is "participant".
	 */

	participantId?: string;
	/**
	 * @description
	 * Author type: human moderator or AI participant.
	 */
	type: "moderator" | "participant";
}
