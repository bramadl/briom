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

export class DrizzleGetRoomQuery implements GetRoomQuery {
	constructor(private readonly db: Database) {}

	async execute(input: GetRoomInput): Promise<GetRoomOutput> {
		const room = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, input.roomId),
		});

		if (!room) throw new Error("Room not found");

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
				participantIds: participants.map((p) => p.id),
				turnIds: turns.map((t) => t.id),
				createdAt: room.createdAt.toISOString(),
			},
		};
	}
}
