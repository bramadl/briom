import type { Room } from "../room";

import type { TurnSequence } from "./turn.sequence";

/**
 * @description
 * `TurnSequencer` — Query Port
 *
 * Contract for generating the next sequence number within a room's deliberation.
 * Abstracts the persistence-specific logic of finding the current maximum sequence
 * and incrementing it.
 *
 * **Why a port, not a domain service?**
 * Sequence generation requires database access (to find max existing sequence).
 * Domain services are pure; this belongs to the repository boundary.
 */
export interface TurnSequencer {
	/**
	 * @description
	 * Generates the next sequence number for a turn in the given room.
	 *
	 * @param room - The room where the turn will be created
	 * @returns The next `TurnSequence` (monotonically increasing)
	 */
	nextPositionInside(room: Room): Promise<TurnSequence>;
}
