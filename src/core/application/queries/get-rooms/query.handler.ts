import { type IQuery, type IResult, Result } from "@briom/drimion";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { countDistinct, desc, eq } from "drizzle-orm";

import type { GetRoomsOutput, GetRoomsQuery } from "./query";
import type { RoomSummaryDTO } from "./query.dto";

export class GetRoomsHandler implements IQuery<GetRoomsQuery, GetRoomsOutput> {
	public constructor(private readonly db: Database) {}

	public async execute(_: GetRoomsQuery): Promise<IResult<GetRoomsOutput>> {
		const rows = await this.db
			.select({
				id: roomsTable.id,
				title: roomsTable.title,
				createdAt: roomsTable.createdAt,
				participantCount: countDistinct(participantsTable.id),
				turnCount: countDistinct(turnsTable.id),
			})
			.from(roomsTable)
			.leftJoin(participantsTable, eq(participantsTable.roomId, roomsTable.id))
			.leftJoin(turnsTable, eq(turnsTable.roomId, roomsTable.id))
			.groupBy(roomsTable.id)
			.orderBy(desc(roomsTable.createdAt));

		const summaries: RoomSummaryDTO[] = rows.map((row) => ({
			id: row.id,
			title: row.title,
			createdAt: row.createdAt.toISOString(),
			participantCount: row.participantCount,
			turnCount: row.turnCount,
		}));

		return Result.success(summaries);
	}
}
