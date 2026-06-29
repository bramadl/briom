import type {
	RoomDeliberationDTO,
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnAttachmentDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app/contracts";
import type {
	GetRoomDeliberationInput,
	GetRoomDeliberationOutput,
} from "@briom/core/application/queries/get-room-deliberation/query";
import { and, asc, eq } from "drizzle-orm";

import type { Database } from "../client";
import { participantsTable, roomsTable, turnsTable } from "../schema";
import type { AttachmentRecord } from "../turn/turn.model";

/**
 * @description
 * `DrizzleGetRoomDeliberationQuery` — Infrastructure Query
 *
 * Returns the full denormalized deliberation view for a room in one
 * round-trip (room + participants + turns joined in SQL).
 *
 * **Attachment mapping**
 * `turnsTable.attachments` is a JSONB column of `AttachmentRecord[]`.
 * Each record is mapped to `RoomDeliberationTurnAttachmentDTO` — same
 * fields minus `textContent` (which was never stored in DB).
 *
 * Participant turns always have `attachments: []` by domain invariant;
 * the mapping is consistent regardless.
 *
 * **Why no ORM relations?**
 * Drizzle's `with` / `relations` API adds overhead for this read pattern.
 * Three separate queries (room, participants, turns) then assembled in
 * application memory is simpler, more readable, and fast enough for the
 * turn counts Briom targets (~40 turns per room).
 */
export class DrizzleGetRoomDeliberationQuery {
	public constructor(private readonly db: Database) {}

	public async execute(
		input: GetRoomDeliberationInput,
	): Promise<GetRoomDeliberationOutput> {
		const { roomId, moderatorId } = input;

		const room = await this.db
			.select()
			.from(roomsTable)
			.where(
				and(eq(roomsTable.id, roomId), eq(roomsTable.moderatorId, moderatorId)),
			)
			.limit(1)
			.then((rows) => rows[0] ?? null);

		if (!room) return { room: null };

		const [participants, turns] = await Promise.all([
			this.db
				.select()
				.from(participantsTable)
				.where(eq(participantsTable.roomId, roomId)),
			this.db
				.select()
				.from(turnsTable)
				.where(eq(turnsTable.roomId, roomId))
				.orderBy(asc(turnsTable.sequence)),
		]);

		const participantMap = new Map(participants.map((p) => [p.id, p]));
		const turnDTOs: RoomDeliberationTurnDTO[] = turns.map((turn) => {
			const participant = turn.participantId
				? participantMap.get(turn.participantId)
				: null;

			const profile =
				turn.authorType === "participant" && participant
					? {
							id: participant.id,
							displayName: participant.displayName,
							model: `${participant.provider}/${participant.model}`,
						}
					: null;

			const attachments = this.mapAttachments(
				(turn.attachments ?? []) as AttachmentRecord[],
			);

			return {
				attachments,
				author: {
					type: turn.authorType as "moderator" | "participant",
					profile,
				},
				content: turn.content,
				createdAt: turn.createdAt.toISOString(),
				error: turn.errorKind
					? {
							kind: turn.errorKind,
							message: turn.errorMessage ?? "Unknown error",
							attributes: turn.errorRetryAfter
								? { retryIn: turn.errorRetryAfter }
								: null,
						}
					: null,
				failedAt: turn.failedAt?.toISOString() ?? null,
				id: turn.id,
				intent: turn.intent as RoomDeliberationTurnDTO["intent"],
				settledAt: turn.settledAt?.toISOString() ?? null,
				status: turn.status as RoomDeliberationTurnDTO["status"],
			};
		});

		const participantDTOs: RoomDeliberationParticipantDTO[] = participants.map(
			(p) => ({
				id: p.id,
				model: `${p.provider}/${p.model}`,
				name: p.displayName,
			}),
		);

		const dto: RoomDeliberationDTO = {
			id: room.id,
			info: {
				shortId: room.id.slice(0, 8),
				formedAt: room.createdAt.toISOString(),
				moderatorId: room.moderatorId,
			},
			participants: participantDTOs,
			status: room.status as RoomDeliberationDTO["status"],
			synthesis:
				room.synthesisStatus === "completed" &&
				room.synthesis &&
				room.synthesisCreatedAt &&
				room.synthesisCreatedBy
					? {
							content: room.synthesis,
							createdAt: room.synthesisCreatedAt.toISOString(),
							createdBy: room.synthesisCreatedBy,
						}
					: null,
			synthesisStatus:
				room.synthesisStatus as RoomDeliberationDTO["synthesisStatus"],
			title: room.title,
			topic: room.topic,
			turns: turnDTOs,
		};

		return { room: dto };
	}

	/**
	 * @description
	 * Maps `AttachmentRecord[]` from JSONB → `RoomDeliberationTurnAttachmentDTO[]`.
	 *
	 * `textContent` is intentionally excluded — it was consumed by the LLM
	 * and is never stored in the DB. The FE only needs display metadata + URL.
	 */
	private mapAttachments(
		records: AttachmentRecord[],
	): RoomDeliberationTurnAttachmentDTO[] {
		return records.map((r) => ({
			mediaType: r.mediaType,
			mimeType: r.mimeType,
			name: r.name,
			sizeBytes: r.sizeBytes,
			url: r.url,
		}));
	}
}
