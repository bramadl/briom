import {
	Checkpoint,
	CheckpointId,
	CreditUsage,
	type ICheckpointRepository,
	RoomId,
} from "@briom/core/domain";
import type { DrizzleConn } from "@briom/drizzle/db";
import { checkpointsTable } from "@briom/drizzle/schema";

export class DrizzleCheckpointRepository implements ICheckpointRepository {
	private columns = {
		content: true,
		coverSequences: true,
		createdAt: true,
		generatedBy: true,
		id: true,
		iteration: true,
		previousCheckpointId: true,
		roomId: true,
		usageCompletionTokens: true,
		usageCostUsd: true,
		usagePromptTokens: true,
	} as const;

	public constructor(private db: DrizzleConn) {}

	public async findById(id: CheckpointId): Promise<Checkpoint | null> {
		const checkpoint = await this.db.query.checkpointsTable.findFirst({
			where: { id: id.value() },
			columns: this.columns,
		});

		if (!checkpoint) return null;
		return this.mapToDomain(checkpoint);
	}

	public async findLatestByRoomId(roomId: RoomId): Promise<Checkpoint | null> {
		const checkpoint = await this.db.query.checkpointsTable.findFirst({
			where: { roomId: roomId.value() },
			orderBy: { createdAt: "asc" },
			columns: this.columns,
		});

		if (!checkpoint) return null;
		return this.mapToDomain(checkpoint);
	}

	public async persist(checkpoint: Checkpoint): Promise<void> {
		const record = this.mapToPersistent(checkpoint);
		await this.db.insert(checkpointsTable).values(record);
	}

	private mapToDomain(raw: typeof checkpointsTable.$inferSelect): Checkpoint {
		return Checkpoint.init({
			content: raw.content,
			coverSequences: raw.coverSequences,
			createdAt: raw.createdAt,
			generatedBy: raw.generatedBy,
			id: CheckpointId(raw.id),
			iteration: raw.iteration,
			previousCheckpointId: raw.previousCheckpointId
				? CheckpointId(raw.previousCheckpointId)
				: null,
			roomId: RoomId(raw.roomId),
			usage: [
				raw.usageCompletionTokens,
				raw.usageCostUsd,
				raw.usagePromptTokens,
			].every((v) => v !== null)
				? CreditUsage.init({
						completionTokens: raw.usageCompletionTokens,
						costUsd: raw.usageCostUsd,
						promptTokens: raw.usagePromptTokens,
					})
				: null,
		});
	}

	private mapToPersistent(
		checkpoint: Checkpoint,
	): typeof checkpointsTable.$inferInsert {
		return {
			content: checkpoint.content,
			coverSequences: checkpoint.coverSequences,
			generatedBy: checkpoint.generatedBy,
			id: checkpoint.id.value(),
			iteration: checkpoint.iteration,
			roomId: checkpoint.roomId.value(),
			createdAt: checkpoint.get("createdAt"),
			previousCheckpointId: checkpoint.previousCheckpointId?.value(),
			usageCompletionTokens: checkpoint.usage?.completionTokens,
			usageCostUsd: checkpoint.usage?.costUsd,
			usagePromptTokens: checkpoint.usage?.promptTokens,
		};
	}
}
