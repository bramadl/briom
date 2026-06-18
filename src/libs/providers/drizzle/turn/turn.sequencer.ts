import type { Room } from "@briom/domain";
import { TurnSequence, type TurnSequencer } from "@briom/domain/turn";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { eq, max } from "drizzle-orm";

/**
 * @description
 * `DrizzleTurnSequencer` — Infrastructure Sequencer
 *
 * PostgreSQL implementation of `TurnSequencer`.
 * Generates next sequence number by querying `MAX(sequence)` for a room.
 *
 * **Concurrency Safety Disclaimer**
 * This implementation is NOT strictly serializable under high concurrency.
 * Two simultaneous calls could read the same max and generate duplicates.
 *
 * For MVP, this is acceptable. For production, this will be considered:
 * - Database sequence objects
 * - Advisory locks
 * - UUID-based ordering (no sequence numbers–or ULID)
 */
export class DrizzleTurnSequencer implements TurnSequencer {
	constructor(private readonly db: Database) {}

	/**
	 * Generates next sequence number for a room.
	 *
	 * @param room - Room to generate sequence for
	 * @returns Next TurnSequence (current max + 1, or 1 if no turns)
	 */
	async nextPositionInside(room: Room): Promise<TurnSequence> {
		const [result] = await this.db
			.select({ maxSeq: max(turnsTable.sequence) })
			.from(turnsTable)
			.where(eq(turnsTable.roomId, room.id.value()));

		const nextValue = (result?.maxSeq ?? 0) + 1;
		return TurnSequence.fromNumber(nextValue);
	}
}
