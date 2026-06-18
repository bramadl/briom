import type { Room } from "@briom/domain";
import type { Turn, TurnId, TurnRepository } from "@briom/domain/turn";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

import { TurnMapper } from "./turn.mapper";

export class DrizzleTurnRepository implements TurnRepository {
	constructor(private readonly db: Database) {}

	async findById(id: TurnId): Promise<Turn | null> {
		const record = await this.db.query.turnsTable.findFirst({
			where: eq(turnsTable.id, id.value()),
		});
		return record ? TurnMapper.toDomain(record) : null;
	}

	async findByRoom(room: Room): Promise<Turn[]> {
		const records = await this.db
			.select()
			.from(turnsTable)
			.where(eq(turnsTable.roomId, room.id.value()))
			.orderBy(asc(turnsTable.sequence));
		return records.map(TurnMapper.toDomain);
	}

	async persist(turn: Turn): Promise<void> {
		const record = TurnMapper.toPersistence(turn);
		await this.db
			.insert(turnsTable)
			.values(record)
			.onConflictDoUpdate({
				target: turnsTable.id,
				set: {
					content: record.content,
					status: record.status,
					settledAt: record.settledAt,
					failedAt: record.failedAt,
					errorKind: record.errorKind,
					errorMessage: record.errorMessage,
					errorRetryAfter: record.errorRetryAfter,
				},
			});
	}
}
