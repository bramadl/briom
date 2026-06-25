import type {
	GetRoomDeliberationInput,
	GetRoomDeliberationOutput,
	GetRoomDeliberationQuery,
	RoomDeliberationDTO,
	RoomDeliberationSynthesisDTO,
	RoomDeliberationTurnDTO,
} from "@briom/core/application";
import type {
	IntentOption,
	RoomStatusOption,
	STREAM_ERROR,
	SynthesisProcess,
	TurnStatusOption,
} from "@briom/core/domain";
import type { Database } from "@briom/drizzle/client";
import {
	participantsTable,
	roomsTable,
	turnsTable,
} from "@briom/drizzle/schema";
import { asc, eq } from "drizzle-orm";

/**
 * @description
 * `DrizzleGetRoomDeliberationQuery` — Infrastructure Query
 *
 * Returns the full denormalized deliberation view in two parallel DB queries,
 * assembled in the application layer via an in-memory participant Map.
 *
 * **Query strategy**
 * 1. Load room row (single lookup)
 * 2. In parallel: load all participants + all turns for this room
 * 3. Build a `participantId → { displayName, model }` Map (O(n), n ≤ 4)
 * 4. Map each turn row, embedding author profile from the Map
 *
 * No ORM JOIN is used deliberately — Drizzle expands JOINs to one row per
 * joined record, requiring deduplication logic that is messier than two
 * clean queries at MVP participant counts.
 *
 * **Author profile embedding**
 * - Participant turns: profile populated from the participants Map via
 *   `participantId`. If the participant has been soft-deleted (rare — the
 *   schema uses `ON DELETE SET NULL`), profile falls back to `null` to
 *   prevent render errors.
 * - Moderator turns: profile is always `null` (no moderator display entity
 *   in the MVP domain model).
 *
 * **Synthesis**
 * `synthesis` field in the DTO is `null` unless `synthesisStatus === "completed"`
 * AND synthesis content exists. FE always checks `synthesisStatus` to
 * distinguish pending/failed from the absence of a synthesis document.
 */
export class DrizzleGetRoomDeliberationQuery
	implements GetRoomDeliberationQuery
{
	constructor(private readonly db: Database) {}

	async execute(
		input: GetRoomDeliberationInput,
	): Promise<GetRoomDeliberationOutput> {
		const room = await this.db.query.roomsTable.findFirst({
			where: eq(roomsTable.id, input.roomId),
		});

		if (!room) return { deliberation: null };

		const [participantRecords, turnRecords] = await Promise.all([
			this.db
				.select()
				.from(participantsTable)
				.where(eq(participantsTable.roomId, input.roomId)),
			this.db
				.select()
				.from(turnsTable)
				.where(eq(turnsTable.roomId, input.roomId))
				.orderBy(asc(turnsTable.sequence)),
		]);

		const participantMap = new Map(
			participantRecords.map((p) => [
				p.id,
				{ displayName: p.displayName, model: `${p.provider}/${p.model}` },
			]),
		);

		const turns: RoomDeliberationTurnDTO[] = turnRecords.map((record) => {
			const isParticipant = record.authorType === "participant";
			const profile =
				isParticipant && record.participantId
					? (participantMap.get(record.participantId) ?? null)
					: null;

			const error: RoomDeliberationTurnDTO["error"] = record.errorKind
				? {
						kind: record.errorKind as (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR],
						message: record.errorMessage ?? "Unknown error",
						attributes:
							record.errorRetryAfter != null
								? { retryIn: record.errorRetryAfter }
								: null,
					}
				: null;

			return {
				id: record.id,
				author: {
					type: record.authorType as "moderator" | "participant",
					profile,
				},
				content: record.content,
				intent: record.intent as IntentOption | null,
				state: record.status as TurnStatusOption,
				error,
			} satisfies RoomDeliberationTurnDTO;
		});

		const synthesisStatus = room.synthesisStatus as SynthesisProcess;
		const synthesis: RoomDeliberationSynthesisDTO | null =
			synthesisStatus === "completed" &&
			room.synthesis &&
			room.synthesisCreatedBy &&
			room.synthesisCreatedAt
				? {
						content: room.synthesis,
						createdBy: room.synthesisCreatedBy,
						createdAt: room.synthesisCreatedAt.toISOString(),
					}
				: null;

		const deliberation: RoomDeliberationDTO = {
			id: room.id,
			title: room.title,
			status: room.status as RoomStatusOption,
			topic: room.topic,
			participants: participantRecords.map((p) => ({
				id: p.id,
				name: p.displayName,
				model: `${p.provider}/${p.model}`,
			})),
			turns,
			synthesis,
			synthesisStatus,
			info: {
				shortId: room.id.slice(0, 8),
				formedAt: room.createdAt.toISOString(),
				moderatorId: room.moderatorId,
			},
		};

		return { deliberation };
	}
}
