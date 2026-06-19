import type {
	GetRoomsInput,
	GetRoomsOutput,
	GetRoomsQuery,
	RoomDTO,
} from "@briom/core/application";
import type { RoomStatusOption } from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { desc, eq } from "drizzle-orm";

/**
 * @description
 * `DrizzleGetRoomsQuery` — Infrastructure Query
 *
 * PostgreSQL implementation of `GetRoomsQuery`.
 * Loads all rooms with their relations, ordered by creation time descending.
 *
 * **N+1 Warning Acknowledgement**
 * This query loads rooms, then for each room loads participants and turns.
 * For MVP (small room count) this is acceptable. For scale, this will be considered:
 * - JOIN-based single query
 * - Pagination (LIMIT/OFFSET)
 * - Projected fields (exclude turn content)
 */
export class DrizzleGetRoomsQuery implements GetRoomsQuery {
	constructor(private readonly db: Database) {}

	/**
	 * @description
	 * Executes rooms list query.
	 *
	 * @param _input - Empty criteria (MVP lists all)
	 * @returns All rooms with relations, newest first
	 */
	async execute(_input: GetRoomsInput): Promise<GetRoomsOutput> {
		const rooms = await this.db
			.select()
			.from(roomsTable)
			.orderBy(desc(roomsTable.createdAt));

		const roomsWithRelations: RoomDTO[] = await Promise.all(
			rooms.map(async (room) => {
				const [participants, turns] = await Promise.all([
					this.db
						.select({
							id: participantsTable.id,
							model: participantsTable.model,
							provider: participantsTable.provider,
							name: participantsTable.displayName,
						})
						.from(participantsTable)
						.where(eq(participantsTable.roomId, room.id)),
					this.db
						.select({ id: turnsTable.id })
						.from(turnsTable)
						.where(eq(turnsTable.roomId, room.id)),
				]);

				return {
					id: room.id,
					title: room.title,
					status: room.status as RoomStatusOption,
					topic: room.topic,
					moderatorId: room.moderatorId,
					participants: participants.map((p) => ({
						id: p.id,
						model: p.model,
						provider: p.provider,
						name: p.name,
						qualifiedModel: `${p.provider}/${p.name}`,
					})),
					turnIds: turns.map((t) => t.id),
					createdAt: room.createdAt.toISOString(),
				} satisfies RoomDTO;
			}),
		);

		return { rooms: roomsWithRelations };
	}
}
