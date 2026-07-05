import type {
	GetRoomInput,
	GetRoomOutput,
	IGetRoomQuery,
	RoomAttachmentDTO,
	RoomDTO,
	RoomParticipantDTO,
	RoomTurnDTO,
} from "@briom/core/app";
import type { DrizzleConn } from "@briom/drizzle/db";

export class DrizzleGetRoomQuery implements IGetRoomQuery {
	public constructor(private readonly db: DrizzleConn) {}

	public async execute({
		moderatorId,
		roomId,
	}: GetRoomInput): Promise<GetRoomOutput> {
		const roomData = await this.db.query.roomsTable.findFirst({
			where: { moderatorId, id: roomId },
			columns: {
				id: true,
				title: true,
				topic: true,
				status: true,
				createdAt: true,
				moderatorId: true,
				stateKind: true,
				stateOccurredAt: true,
				stateReason: true,
			},
			with: {
				participants: {
					columns: {
						id: true,
						provider: true,
						model: true,
						displayName: true,
					},
					orderBy: { createdAt: "asc" },
				},
				turns: {
					columns: {
						id: true,
						content: true,
						status: true,
						intent: true,
						authorType: true,
						authorId: true,
						attachments: true,
						createdAt: true,
						settledAt: true,
						failedAt: true,
						errorKind: true,
						errorMessage: true,
						errorRetryAfter: true,
					},
					orderBy: { sequence: "asc" },
				},
			},
		});

		if (!roomData) return { room: null };

		const participantsDTO: RoomParticipantDTO[] = roomData.participants.map(
			(p) => ({
				id: p.id,
				model: `${p.provider}/${p.model}`,
				name: p.displayName,
			}),
		);

		const allAttachments: RoomAttachmentDTO[] = [];

		const turnsDTO: RoomTurnDTO[] = roomData.turns.map((t) => {
			const cleanAttachments: RoomAttachmentDTO[] = t.attachments.map(
				(att) => ({
					mediaType: att.mediaType,
					mimeType: att.mimeType,
					name: att.name,
					sizeBytes: att.sizeBytes,
					url: att.url,
				}),
			);

			if (t.authorType === "moderator") {
				allAttachments.push(...cleanAttachments);
			}

			const participantProfile =
				t.authorType === "participant"
					? participantsDTO.find((p) => p.id === t.authorId) || null
					: null;

			return {
				id: t.id,
				content: t.content || "",
				status: t.status as "pending" | "streaming" | "settled" | "failed",
				intent: t.intent,
				createdAt: t.createdAt.toISOString(),
				settledAt: t.settledAt ? t.settledAt.toISOString() : null,
				failedAt: t.failedAt ? t.failedAt.toISOString() : null,
				attachments: cleanAttachments,
				author: {
					type: t.authorType,
					profile: {
						moderator: null,
						participant: participantProfile,
					},
				},
				error:
					t.status === "failed" && t.errorKind
						? {
								kind: t.errorKind,
								message: t.errorMessage || "Turn generation failed",
								attributes: t.errorRetryAfter
									? { retryIn: t.errorRetryAfter }
									: null,
							}
						: null,
			};
		});

		const roomDTO: RoomDTO = {
			id: roomData.id,
			title: roomData.title,
			info: {
				topic: roomData.topic,
				participants: participantsDTO,
				turns: turnsDTO,
				attachments: allAttachments,
				metadata: {
					status: roomData.status,
					shortId: `#${roomData.id.slice(0, 8)}`,
					formedAt: roomData.createdAt.toISOString(),
					moderatorId: roomData.moderatorId,
				},
			},
			state: roomData.stateKind
				? {
						kind: roomData.stateKind,
						occurredAt: roomData.stateOccurredAt as Date,
						reason:
							roomData.stateReason ??
							"Something went wrong, please contact any administrators.",
					}
				: null,
		};

		return { room: roomDTO };
	}
}
