import type { TurnProposalDTO } from "@briom/app/bak/contracts";

/**
 * @description
 * Input for `GetTurnProposalsQuery`.
 *
 * MVP: only requires room ID. The domain service derives all context
 * (turn history, participant roster, current state) from the room.
 */
export interface GetTurnProposalsInput {
	/**
	 * @description
	 * Room to generate proposals for.
	 */
	roomId: string;
}

/**
 * @description
 * Output from `GetTurnProposalsQuery`.
 *
 * Returns zero or more proposals, sorted by confidence descending.
 * Empty array indicates no valid proposals (e.g., room not deliberating,
 * no participants, or deliberation concluded).
 */
export interface GetTurnProposalsOutput {
	/**
	 * @description
	 * Suggested next turns, ranked by confidence.
	 * FE renders as contextual suggestion bubbles below settled turns.
	 */
	proposals: TurnProposalDTO[];
}

/**
 * @description
 * `GetTurnProposalsQuery` — Application Query Port
 *
 * Contract for retrieving AI-generated turn proposals within a deliberation.
 * Delegates to `RoomDeliberation.proposeNextTurns()` for context-aware
 * suggestion generation.
 *
 * **Why a Port?**
 * Proposal generation is a domain concern (requires turn history, participant
 * analysis, intent validation). The application layer defines the contract;
 * the domain service implements the logic.
 *
 * **Usage**
 * Called by the FE after each turn settles to populate suggestion bubbles.
 * Proposals are ephemeral — not persisted, regenerated on each query.
 *
 * @see RoomDeliberation.proposeNextTurns — domain logic
 * @see DrizzleGetTurnProposalsQuery — infrastructure implementation
 */
export interface GetTurnProposalsQuery {
	/**
	 * @description
	 * Generates contextual turn proposals for the given room.
	 *
	 * @param input - Room ID to analyze
	 * @returns Ranked proposals, or empty if no valid suggestions
	 */
	execute(input: GetTurnProposalsInput): Promise<GetTurnProposalsOutput>;
}
