import type {
	GetTurnProposalsInput,
	GetTurnProposalsOutput,
	GetTurnProposalsQuery,
} from "@briom/app/queries/get-turn-proposals/query";
import {
	RoomDeliberation,
	RoomId,
	type RoomRepository,
	type TurnRepository,
} from "@briom/domain";

import type { Database } from "../client";

/**
 * @description
 * `DrizzleGetTurnProposalsQuery` — Infrastructure Query
 *
 * PostgreSQL-backed implementation of `GetTurnProposalsQuery`.
 * Reconstitutes the full room aggregate and turn history, then delegates
 * to `RoomDeliberation.proposeNextTurns()` for context-aware suggestion
 * generation.
 *
 * **Query Strategy**
 * 1. Load room with all participants (via `RoomRepository`)
 * 2. Load all turns in sequence order (via `TurnRepository`)
 * 3. Pass to `RoomDeliberation` domain service
 * 4. Map domain proposals to DTOs with rich, dynamic labels
 *
 * **Performance Note**
 * Two repository calls per query. For scale, consider:
 * - JOIN-based single query
 * - Caching recent deliberation context
 * - Background pre-computation of proposals
 *
 * @see GetTurnProposalsQuery — application contract
 * @see RoomDeliberation.proposeNextTurns — domain logic
 * @see ProposalDictionary — rich label generation
 */
export class DrizzleGetTurnProposalsQuery implements GetTurnProposalsQuery {
	/**
	 * @description
	 * Creates the query with injected repositories.
	 *
	 * @param db - Drizzle database client (reserved for future direct queries)
	 * @param roomRepository - Room aggregate reconstitution
	 * @param turnRepository - Turn history loading
	 */
	constructor(
		protected readonly db: Database,
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
	) {}

	/**
	 * @description
	 * Generates turn proposals by reconstituting domain state and delegating
	 * to the `RoomDeliberation` domain service.
	 *
	 * @param input - Room ID to analyze
	 * @returns Ranked proposals with rich labels, or empty if room invalid
	 */
	async execute(input: GetTurnProposalsInput): Promise<GetTurnProposalsOutput> {
		const room = await this.roomRepository.findById(RoomId(input.roomId));
		if (!room) return { proposals: [] };

		const turns = await this.turnRepository.findByRoom(room);
		const participants = room.get("participants");

		const deliberation = new RoomDeliberation();
		const proposals = deliberation.proposeNextTurns({
			room,
			turns,
			participants,
		});

		return {
			proposals: proposals.map((p) => ({
				participantId: p.participantId.value(),
				label: p.rationale,
				intent: p.intent.get("value"),
				confidence: p.confidence,
			})),
		};
	}
}
