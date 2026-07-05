import type { TurnProposalDTO } from "../.contracts/turn-proposal.dto";

/**
 * @description
 * Input for `GetProposalsQuery`.
 */
export interface GetProposalsInput {
	/**
	 * @description
	 * The ID of the moderator requesting this resource.
	 *
	 * Used for authorization (Auth-Z) checks.
	 * Format: UUID v4. Used
	 */
	moderatorId: string;

	/**
	 * @description
	 * Room to generate proposals for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GetProposalsQuery`.
 */
export interface GetProposalsOutput {
	/**
	 * @description
	 * Suggested next turns, ranked by confidence.
	 * FE renders as contextual suggestion bubbles below settled turns.
	 *
	 * Returns zero or more proposals, sorted by confidence descending.
	 * Empty array indicates no valid proposals.
	 */
	proposals: TurnProposalDTO[];
}

/**
 * @description
 * `GetProposalsQuery` — Application Query Port
 *
 * Contract for retrieving AI-generated turn proposals within a deliberation.
 * Delegates to `ProposalGenerator.proposeNextTurns()` for context-aware
 * suggestion generation.
 *
 * @see GetProposalHandler — application handler
 * @see ProposalGenerator.proposeNextTurns — domain logic
 */
export class GetProposalsQuery {
	public constructor(public readonly input: GetProposalsInput) {}
}
