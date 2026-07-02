import type { TurnIntent } from "@briom/domain";

/**
 * @description
 * Input data required to execute the `AcceptProposal` command.
 */
export interface AcceptProposalInput {
	/**
	 * @description
	 * The intent carried by the accepted proposal — determines the
	 * system prompt angle the participant will respond with
	 * (e.g. CRITIQUE, EXPAND, CHALLENGE).
	 */
	intent: TurnIntent;

	/**
	 * @description
	 * The ID of the moderator performing this action.
	 * Used for authorization (Auth-Z) checks. Format: UUID v4.
	 */
	moderatorId: string;

	/**
	 * @description
	 * The participant selected by the accepted proposal.
	 * Format: UUID v4.
	 */
	participantId: string;

	/**
	 * @description
	 * The ID of the room this proposal belongs to.
	 * Format: UUID v4.
	 */
	roomId: string;
}

/**
 * @description
 * Output data returned after the `AcceptProposal` command executes successfully.
 */
export interface AcceptProposalOutput {
	/**
	 * @description
	 * Profile details of the accepted responder, so FE can render the
	 * thinking/streaming card without a follow-up fetch.
	 */
	participant: {
		/**
		 * @description
		 * Display name of the participant to be rendered on the loading card.
		 */
		displayName: string;

		/**
		 * @description
		 * The unique identifier of the participant.
		 */
		id: string;

		/**
		 * @description
		 * The qualified model name of the LLM (e.g., `gpt-4o`, `claude-3-5-sonnet`).
		 */
		qualifiedModel: string;
	};

	/**
	 * @description
	 * Summary of the pending participant turn created from this proposal.
	 */
	turn: {
		/**
		 * @description
		 * The unique identifier of the newly created participant turn.
		 */
		id: string;

		/**
		 * @description
		 * The intent this turn was accepted with.
		 */
		intent: TurnIntent;
	};
}

/**
 * @description
 * A command that lets a Moderator accept a suggested turn proposal —
 * skipping free-text input entirely by directly claiming the room's
 * turn slot for a pre-selected participant and intent. Functionally a
 * shortcut around `SendModeratorTurn`'s "decide next responder" step;
 * the decision was already made by `ProposalGenerator` and presented
 * to the moderator as a button.
 */
export class AcceptProposalCommand {
	public constructor(public readonly input: AcceptProposalInput) {}
}
