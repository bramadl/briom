import { type IQuery, type IResult, Result } from "@briom/drimion";
import type { Database } from "@briom/drizzle/client";
import { participantsTable, turnsTable } from "@briom/drizzle/schema";
import { eq, sql } from "drizzle-orm";

import type { GetRoomsErrors, GetRoomsOutput, GetRoomsQuery } from "./query";
import type { RoomSummaryDTO } from "./query.dto";

export class GetRoomsHandler
	implements IQuery<GetRoomsQuery, GetRoomsOutput, GetRoomsErrors>
{
	public constructor(private readonly db: Database) {}

	public async execute(
		_: GetRoomsQuery,
	): Promise<IResult<GetRoomsOutput, GetRoomsErrors>> {
		const rooms = await this.db.query.roomsTable.findMany();

		const summaries: RoomSummaryDTO[] = await Promise.all(
			rooms.map(async (room) => {
				const [participantCount, turnCount] = await Promise.all([
					this.db
						.select({ count: sql<number>`count(*)` })
						.from(participantsTable)
						.where(eq(participantsTable.roomId, room.id)),
					this.db
						.select({ count: sql<number>`count(*)` })
						.from(turnsTable)
						.where(eq(turnsTable.roomId, room.id)),
				]);

				return {
					id: room.id,
					title: room.title,
					createdAt: room.createdAt.toISOString(),
					participantCount: Number(participantCount[0]?.count ?? 0),
					turnCount: Number(turnCount[0]?.count ?? 0),
				};
			}),
		);

		return Result.success({ rooms: summaries });
	}
}
