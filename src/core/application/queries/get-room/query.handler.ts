import { RoomNotFoundError } from "@briom/domain";
import { type IQuery, type IResult, Result } from "@briom/drimion";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

import type { GetRoomOutput, GetRoomQuery } from "./query";

export class GetRoomHandler
	implements IQuery<GetRoomQuery, GetRoomOutput, RoomNotFoundError>
{
	public constructor(private readonly db: Database) {}

	public async execute({
		input,
	}: GetRoomQuery): Promise<IResult<GetRoomOutput, RoomNotFoundError>> {
		const room = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, input.roomId),
		});

		if (!room) return Result.error(new RoomNotFoundError(input.roomId));

		const [participants, turns] = await Promise.all([
			this.db
				.select()
				.from(participantsTable)
				.where(eq(participantsTable.roomId, input.roomId)),
			this.db
				.select()
				.from(turnsTable)
				.where(eq(turnsTable.roomId, input.roomId))
				.orderBy(asc(turnsTable.sequenceNumber)),
		]);

		return Result.success({
			id: room.id,
			title: room.title,
			createdAt: room.createdAt.toISOString(),
			participants: participants.map((p) => ({
				id: p.id,
				displayName: p.displayName,
				provider: p.provider,
				model: p.model,
			})),
			turns: turns.map((t) => ({
				id: t.id,
				sequenceNumber: t.sequenceNumber,
				role: t.authorType,
				participantId: t.participantId,
				intent: t.intent,
				content: t.content,
				status: t.status ?? "settled",
				createdAt: t.createdAt.toISOString(),
			})),
		});
	}
}
