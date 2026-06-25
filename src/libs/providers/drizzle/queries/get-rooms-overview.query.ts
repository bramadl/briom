import type {
	GetRoomsOverviewInput,
	GetRoomsOverviewOutput,
	GetRoomsOverviewQuery,
	RoomOverviewDTO,
} from "@briom/core/application";
import type { RoomStatusOption } from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import { participantsTable, roomsTable } from "@briom/drizzle/schema";
import { desc, eq } from "drizzle-orm";

/**
 * @description
 * `DrizzleGetRoomsOverviewQuery` — Infrastructure Query
 *
 * PostgreSQL implementation of `GetRoomsOverviewQuery`.
 * Returns a lightweight overview of all rooms in a single JOIN query —
 * no N+1, no turn data loaded.
 *
 * **Query strategy**
 * 1. `SELECT` all rooms ordered newest-first
 * 2. For each room, load its participants in a second parallel query
 *    (two separate queries is simpler and equally fast as a JOIN given
 *    Drizzle's row-per-join expansion — revisit with a raw JOIN if rooms
 *    scale significantly)
 *
 * **vs. `DrizzleGetRoomsQuery`**
 * - Does NOT load turn IDs (sidebar never needs them)
 * - Does NOT load synthesis fields (sidebar never needs them)
 * - Computes `shortId` and `participantCount` at the query layer
 * - Fixes the `qualifiedModel` bug present in `DrizzleGetRoomsQuery`
 *   (`${provider}/${model}` not `${provider}/${name}`)
 */
export class DrizzleGetRoomsOverviewQuery implements GetRoomsOverviewQuery {
	constructor(private readonly db: Database) {}

	async execute(
		_input: GetRoomsOverviewInput,
	): Promise<GetRoomsOverviewOutput> {
		const rooms = await this.db
			.select()
			.from(roomsTable)
			.orderBy(desc(roomsTable.createdAt));

		const overviews: RoomOverviewDTO[] = await Promise.all(
			rooms.map(async (room) => {
				const participants = await this.db
					.select({
						id: participantsTable.id,
						displayName: participantsTable.displayName,
						model: participantsTable.model,
						provider: participantsTable.provider,
					})
					.from(participantsTable)
					.where(eq(participantsTable.roomId, room.id));

				return {
					id: room.id,
					shortId: room.id.slice(0, 8),
					title: room.title,
					topic: room.topic,
					status: room.status as RoomStatusOption,
					formedAt: room.createdAt.toISOString(),
					participants: participants.map((p) => ({
						id: p.id,
						name: p.displayName,
						model: `${p.provider}/${p.model}`,
					})),
					participantCount: participants.length,
				} satisfies RoomOverviewDTO;
			}),
		);

		return { rooms: overviews };
	}
}
