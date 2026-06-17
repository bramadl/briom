import type { RoomId } from "@briom/domain/room";
import type {
	Turn,
	TurnId,
	TurnRepository,
	TurnStatus,
} from "@briom/domain/turn";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

import { TurnMapper } from "./turn.mapper";

export class DrizzleTurnRepository implements TurnRepository {
	constructor(private readonly db: Database) {}

	async delete(roomId: RoomId, turnId: TurnId): Promise<boolean> {
		const deleted = await this.db
			.delete(turnsTable)
			.where(
				and(
					eq(turnsTable.roomId, roomId as string),
					eq(turnsTable.id, turnId as string),
					inArray(turnsTable.status, ["pending", "failed"]),
				),
			)
			.returning({ id: turnsTable.id });

		return deleted.length > 0;
	}

	async findByRoom(roomId: RoomId): Promise<Turn[]> {
		const records = await this.db
			.select()
			.from(turnsTable)
			.where(eq(turnsTable.roomId, roomId as string))
			.orderBy(asc(turnsTable.sequenceNumber));

		return records.map(TurnMapper.toDomain);
	}

	async getByRoom(roomId: RoomId, turnId: TurnId): Promise<Turn | null> {
		const [record] = await this.db
			.select()
			.from(turnsTable)
			.where(
				and(
					eq(turnsTable.roomId, roomId as string),
					eq(turnsTable.id, turnId as string),
				),
			)
			.limit(1);

		if (!record) return null;
		return TurnMapper.toDomain(record);
	}

	async save(turn: Turn): Promise<void> {
		const record = TurnMapper.toPersistence(turn);
		await this.db
			.insert(turnsTable)
			.values(record)
			.onConflictDoUpdate({
				target: turnsTable.id,
				set: { content: record.content, status: record.status },
			});
	}

	async updateStatus(
		id: TurnId,
		status: TurnStatus,
		content?: string,
	): Promise<void> {
		await this.db
			.update(turnsTable)
			.set({
				status,
				...(content !== undefined ? { content } : {}),
			})
			.where(eq(turnsTable.id, id as string));
	}
}
