import type { IntentOption } from "@briom/core/domain";

interface BaseTurnDTO {
	/**
	 * @description
	 * The markdown content sent by parties.
	 */
	content: string;
	/**
	 * @description
	 * An UUID assigned upon turn creation.
	 */
	id: string;
	/**
	 * @description
	 * Date when this turn is settled the first time.
	 */
	settledAt: Date;
}

export interface ModeratorTurnDTO extends BaseTurnDTO {}

export interface ParticipantTurnDTO extends BaseTurnDTO {
	/**
	 * @description
	 * The intent of a specific turn initiated by participant.
	 */
	intent: IntentOption;
}

export type TurnDTO =
	| ({
			/**
			 * @description
			 * Wether this turn is from moderator or not.
			 */
			isFromModerator: true;
	  } & ModeratorTurnDTO)
	| ({
			/**
			 * @description
			 * Wether this turn is from participant or not.
			 */
			isFromParticipant: true;
	  } & ParticipantTurnDTO);
