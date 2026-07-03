import type {
	GetRoomsInput,
	GetRoomsOutput,
	IGetRoomsQuery,
	RoomOverviewDTO,
	RoomParticipantDTO,
} from "@briom/core/app";
import type { DrizzleConn } from "@briom/drizzle/db";

export class DrizzleGetRoomsQuery implements IGetRoomsQuery {
	public constructor(private readonly db: DrizzleConn) {}

	public async execute({
		moderatorId,
	}: GetRoomsInput): Promise<GetRoomsOutput> {
		const roomsData = await this.db.query.roomsTable.findMany({
			where: { moderatorId },
			orderBy: { updatedAt: "desc" },
			columns: {
				id: true,
				title: true,
				status: true,
				topic: true,
				createdAt: true,
			},
			with: {
				participants: {
					columns: {
						id: true,
						provider: true,
						model: true,
						displayName: true,
					},
					orderBy: { createdAt: "asc" },
				},
			},
		});

		const rooms: RoomOverviewDTO[] = roomsData.map((room) => {
			const participants: RoomParticipantDTO[] = room.participants.map((p) => ({
				id: p.id,
				model: `${p.provider}/${p.model}`,
				name: p.displayName,
			}));

			return {
				id: room.id,
				shortId: `#${room.id.slice(0, 8)}`,
				title: room.title,
				status: room.status,
				topic: room.topic,
				formedAt: room.createdAt.toISOString(),
				participantCount: participants.length,
				participants,
			};
		});

		return { rooms };
	}
}
