import type { ParticipantId } from "../../participant/participant.id";
import type { TurnIntent } from "../turn.intent";

/**
 * @description
 * A suggested next turn — who might speak, with what intent, and why.
 *
 * Suggestions only. The moderator always has final authority on who speaks;
 * Briom never autonomously initiates a turn on a proposal's behalf.
 */
export interface ProposalResult {
	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	confidence: number;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	intent: TurnIntent;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	participantId: ParticipantId;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	rationale: string;
}
