import type {
	GetRoomInput,
	GetRoomOutput,
	GetRoomQuery,
} from "@briom/core/application";
import type { RoomStatusOption } from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

/**
 * @description
 * `DrizzleGetRoomQuery` — Infrastructure Query
 *
 * PostgreSQL implementation of `GetRoomQuery`.
 * Loads a single room with all relations (participants, turn IDs).
 *
 * **Query Strategy**
 * 1. Primary room lookup by ID
 * 2. Parallel queries for participants and turns
 * 3. Assembly into `RoomDTO`
 *
 * **N+1 Avoidance**
 * Participants and turns are loaded in parallel (Promise.all), not sequentially.
 */
export class DrizzleGetRoomQuery implements GetRoomQuery {
	constructor(private readonly db: Database) {}

	/**
	 * @description
	 * Executes room lookup with relations.
	 *
	 * @param input - Room ID to retrieve
	 * @returns RoomDTO with all relations
	 * @throws Error if room not found
	 */
	async execute(input: GetRoomInput): Promise<GetRoomOutput> {
		const room = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, input.roomId),
		});

		if (!room) return { room: null };

		const [participants, turns] = await Promise.all([
			this.db
				.select()
				.from(participantsTable)
				.where(eq(participantsTable.roomId, input.roomId)),
			this.db
				.select()
				.from(turnsTable)
				.where(eq(turnsTable.roomId, input.roomId))
				.orderBy(asc(turnsTable.sequence)),
		]);

		return {
			room: {
				id: room.id,
				title: room.title,
				status: room.status as RoomStatusOption,
				topic: room.topic,
				moderatorId: room.moderatorId,
				participants: participants.map((p) => ({
					id: p.id,
					model: p.model,
					name: p.displayName,
					provider: p.provider,
					qualifiedModel: `${p.provider}/${p.model}`,
				})),
				turnIds: turns.map((t) => t.id),
				createdAt: room.createdAt.toISOString(),
			},
		};
	}
}
