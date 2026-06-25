import type { Room, RoomId, RoomRepository } from "@briom/domain";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { eq } from "drizzle-orm";

import { ParticipantMapper, RoomMapper } from "./room.mapper";

/**
 * @description
 * `DrizzleRoomRepository` — Infrastructure Repository
 *
 * PostgreSQL implementation of RoomRepository using Drizzle ORM.
 * Handles the full reconstitution and persistence of Room aggregates
 * including their Participant entities.
 *
 * **Query Strategy**
 * - findById: Loads room + participants + turn IDs in parallel queries
 * - persist: Upserts room, then upserts each participant individually
 * - close: DELETE cascade removes room and participants (turns handled separately)
 *
 * **Transaction Boundaries**
 * Room and participants are persisted together (they share the same
 * aggregate boundary). Turns are NOT persisted here — they have their own
 * repository and lifecycle.
 *
 * @see RoomRepository — domain contract
 * @see RoomMapper — for domain ↔ DB translation
 */
export class DrizzleRoomRepository implements RoomRepository {
	constructor(private readonly db: Database) {}

	/**
	 * @description
	 * Finds a room by ID with all relations.
	 *
	 * Executes 3 parallel queries:
	 * 1. Room row by ID
	 * 2. Participants by roomId
	 * 3. Turn IDs by roomId (ordered by sequence)
	 *
	 * @param id - Room ID to find
	 * @returns Reconstituted `Room` aggregate, or null if not found
	 */
	async findById(id: RoomId): Promise<Room | null> {
		const record = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, id.value()),
		});

		if (!record) return null;

		const [participantRecords, turnRecords] = await Promise.all([
			this.db
				.select()
				.from(participantsTable)
				.where(eq(participantsTable.roomId, id.value())),
			this.db
				.select({ id: turnsTable.id })
				.from(turnsTable)
				.where(eq(turnsTable.roomId, id.value()))
				.orderBy(turnsTable.sequence),
		]);

		return RoomMapper.toDomain(
			record,
			participantRecords,
			turnRecords.map((t) => t.id),
		);
	}

	/**
	 * @description
	 * Persists a room and its participants.
	 *
	 * Uses upsert (INSERT ... ON CONFLICT UPDATE) for idempotency.
	 * Room is updated first, then each participant is upserted individually.
	 *
	 * @param room - Room aggregate to persist
	 */
	async persist(room: Room): Promise<void> {
		const record = RoomMapper.toPersistence(room);
		await this.db
			.insert(roomsTable)
			.values(record)
			.onConflictDoUpdate({
				target: roomsTable.id,
				set: {
					title: record.title,
					status: record.status,
					topic: record.topic,
					synthesis: record.synthesis,
					synthesisStatus: record.synthesisStatus,
					synthesisCreatedAt: record.synthesisCreatedAt,
					synthesisCreatedBy: record.synthesisCreatedBy,
				},
			});

		const participants = room.get("participants");
		for (const participant of participants) {
			const pRecord = ParticipantMapper.toPersistence(participant);
			await this.db
				.insert(participantsTable)
				.values(pRecord)
				.onConflictDoUpdate({
					target: participantsTable.id,
					set: {
						displayName: pRecord.displayName,
					},
				});
		}
	}

	/**
	 * @description
	 * Deletes a room and its participants (cascade).
	 *
	 * @param room - Room to delete
	 */
	async close(room: Room): Promise<void> {
		await this.db.delete(roomsTable).where(eq(roomsTable.id, room.id.value()));
	}
}
