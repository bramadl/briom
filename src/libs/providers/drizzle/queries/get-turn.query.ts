import type {
	GetTurnInput,
	GetTurnOutput,
	GetTurnQuery,
} from "@briom/core/application";
import type {
	IntentOption,
	STREAM_ERROR,
	TurnStatusOption,
} from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import { turnsTable } from "@briom/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleGetTurnQuery implements GetTurnQuery {
	constructor(private readonly db: Database) {}

	async execute(input: GetTurnInput): Promise<GetTurnOutput> {
		const record = await this.db.query.turnsTable.findFirst({
			where: eq(turnsTable.id, input.turnId),
		});

		if (!record) throw new Error("Turn not found");

		return {
			turn: {
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
			},
		};
	}
}
