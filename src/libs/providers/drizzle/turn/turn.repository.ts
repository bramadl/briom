import type { RoomId } from "@briom/domain/room";
import type { Turn, TurnRepository } from "@briom/domain/turn";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

import { TurnMapper } from "./turn.mapper";

export class DrizzleTurnRepository implements TurnRepository {
	constructor(private readonly db: Database) {}

	async findByRoom(roomId: RoomId): Promise<Turn[]> {
		const records = await this.db
			.select()
			.from(turnsTable)
			.where(eq(turnsTable.roomId, roomId as string))
			.orderBy(asc(turnsTable.sequenceNumber));

		return records.map(TurnMapper.toDomain);
	}

	async save(turn: Turn): Promise<void> {
		const record = TurnMapper.toPersistence(turn);
		await this.db
			.insert(turnsTable)
			.values(record)
			.onConflictDoUpdate({
				target: turnsTable.id,
				set: { content: record.content },
			});
	}
}
