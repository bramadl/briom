import type {
	GetRoomsInput,
	GetRoomsOutput,
	GetRoomsQuery,
} from "@briom/core/application";
import type { RoomStatusOption } from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export class DrizzleGetRoomsQuery implements GetRoomsQuery {
	constructor(private readonly db: Database) {}

	async execute(_input: GetRoomsInput): Promise<GetRoomsOutput> {
		const rooms = await this.db
			.select()
			.from(roomsTable)
			.orderBy(desc(roomsTable.createdAt));

		const roomsWithRelations = await Promise.all(
			rooms.map(async (room) => {
				const [participants, turns] = await Promise.all([
					this.db
						.select({ id: participantsTable.id })
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
					participantIds: participants.map((p) => p.id),
					turnIds: turns.map((t) => t.id),
					createdAt: room.createdAt.toISOString(),
				};
			}),
		);

		return { rooms: roomsWithRelations };
	}
}
