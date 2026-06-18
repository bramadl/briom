import type { Room } from "@briom/domain";
import type { Turn, TurnId, TurnRepository } from "@briom/domain/turn";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

import { TurnMapper } from "./turn.mapper";

/**
 * @description
 * `DrizzleTurnRepository` — Infrastructure Repository
 *
 * PostgreSQL implementation of `TurnRepository` using Drizzle ORM.
 * Handles the reconstitution and persistence of Turn aggregates.
 *
 * **Query Strategy**
 * - `findById`: Single row lookup by primary key
 * - `findByRoom`: All turns for a room, ordered by sequence ascending
 * - `persist`: Upsert with conflict resolution on id
 *
 * **Index Usage**
 * - `Primary key lookup`: O(1) via turns.id
 * - `Room-scoped query`: O(log n) via turns_room_status_idx
 * - `Sequence ordering`: O(n log n) via turns.sequence sort
 *
 * @see TurnRepository — domain contract
 * @see TurnMapper — for domain ↔ DB translation
 */
export class DrizzleTurnRepository implements TurnRepository {
	constructor(private readonly db: Database) {}

	/**
	 * @description
	 * Finds a turn by ID.
	 *
	 * @param id - Turn ID to find
	 * @returns Reconstituted `Turn` aggregate, or null if not found
	 */
	async findById(id: TurnId): Promise<Turn | null> {
		const record = await this.db.query.turnsTable.findFirst({
			where: eq(turnsTable.id, id.value()),
		});
		return record ? TurnMapper.toDomain(record) : null;
	}

	/**
	 * @description
	 * Finds all turns in a room, ordered by sequence.
	 *
	 * @param room - Room to find turns for
	 * @returns Array of reconstituted `Turn` aggregates in sequence order
	 */
	async findByRoom(room: Room): Promise<Turn[]> {
		const records = await this.db
			.select()
			.from(turnsTable)
			.where(eq(turnsTable.roomId, room.id.value()))
			.orderBy(asc(turnsTable.sequence));
		return records.map(TurnMapper.toDomain);
	}

	/**
	 * @description
	 * Persists a turn.
	 *
	 * Uses upsert to handle both new turns and state updates.
	 * On conflict, updates mutable fields: content, status, timestamps, error.
	 *
	 * @param turn - Turn aggregate to persist
	 */
	async persist(turn: Turn): Promise<void> {
		const record = TurnMapper.toPersistence(turn);
		await this.db
			.insert(turnsTable)
			.values(record)
			.onConflictDoUpdate({
				target: turnsTable.id,
				set: {
					content: record.content,
					status: record.status,
					settledAt: record.settledAt,
					failedAt: record.failedAt,
					errorKind: record.errorKind,
					errorMessage: record.errorMessage,
					errorRetryAfter: record.errorRetryAfter,
				},
			});
	}
}
