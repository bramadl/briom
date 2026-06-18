import type {
	GetTurnsInput,
	GetTurnsOutput,
	GetTurnsQuery,
} from "@briom/core/application";
import type {
	IntentOption,
	STREAM_ERROR,
	TurnStatusOption,
} from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

export class DrizzleGetTurnsQuery implements GetTurnsQuery {
	constructor(private readonly db: Database) {}

	async execute(input: GetTurnsInput): Promise<GetTurnsOutput> {
		const records = await this.db
			.select()
			.from(turnsTable)
			.where(eq(turnsTable.roomId, input.roomId))
			.orderBy(asc(turnsTable.sequence));

		return {
			turns: records.map((record) => ({
				id: record.id,
				roomId: record.roomId,
				sequence: record.sequence,
				author: {
					type: record.authorType,
					moderatorId: record.moderatorId ?? undefined,
					participantId: record.participantId ?? undefined,
				},
				intent: record.intent as IntentOption | null,
				perspective: {
					content: record.content,
					renderedAt: record.settledAt?.toISOString() ?? null,
				},
				status: record.status as TurnStatusOption,
				tokens: [],
				error: record.errorKind
					? {
							kind: record.errorKind as (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR],
							message: record.errorMessage || "Unknown error",
							occurredAt:
								record.failedAt?.toISOString() || new Date().toISOString(),
							retryAfter: record.errorRetryAfter ?? undefined,
						}
					: null,
				previousTurnId: record.previousTurnId,
				createdAt: record.createdAt.toISOString(),
				settledAt: record.settledAt?.toISOString() ?? null,
				failedAt: record.failedAt?.toISOString() ?? null,
			})),
		};
	}
}
