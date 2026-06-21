import type { IntentOption } from "@briom/domain";

/**
 * @description
 * Input for `InitiateParticipantTurnCommand`.
 */
export interface InitiateParticipantTurnInput {
	/**
	 * @description
	 * Purpose of this contribution (respond, critique, expand, etc.).
	 */
	intent: IntentOption;
	/**
	 * @description
	 * Participant ID (must be invited to the room).
	 */
	participantId: string;
	/**
	 * @description
	 * Room to contribute to.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `InitiateParticipantTurnCommand`.
 */
export interface InitiateParticipantTurnOutput {
	/**
	 * @description
	 * ID of the created turn.
	 */
	turnId: string;
}

/**
 * @description
 * `InitiateParticipantTurnCommand` — Command
 *
 * Intent: Start an AI participant's contribution to the deliberation.
 *
 * This is the most complex command in Briom. It triggers the full LLM
 * streaming lifecycle: pending → streaming → settled (or failed).
 *
 * **Human-Led Principle**
 * The moderator decides WHICH participant speaks and with WHAT intent.
 * The command handler executes that decision but never autonomously chooses.
 *
 * @see InitiateParticipantTurnHandler — for execution logic
 * @see Turn.initiateParticipantTurn — for domain factory
 */
export class InitiateParticipantTurnCommand {
	public constructor(public readonly input: InitiateParticipantTurnInput) {}
}
