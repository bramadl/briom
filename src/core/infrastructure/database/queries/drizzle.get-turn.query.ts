import type {
	GetTurnInput,
	GetTurnOutput,
	IGetTurnQuery,
	RoomAttachmentDTO,
	RoomParticipantDTO,
	RoomTurnDTO,
} from "@briom/core/app";
import type { DrizzleConn } from "@briom/drizzle/db";

export class DrizzleGetTurnQuery implements IGetTurnQuery {
	public constructor(private readonly db: DrizzleConn) {}

	public async execute({ turnId }: GetTurnInput): Promise<GetTurnOutput> {
		const turnData = await this.db.query.turnsTable.findFirst({
			where: { id: turnId },
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
			with: {
				room: {
					columns: { id: true },
					with: {
						participants: {
							columns: {
								id: true,
								provider: true,
								model: true,
								displayName: true,
							},
						},
					},
				},
			},
		});

		if (!turnData) return { turn: null };

		const attachments: RoomAttachmentDTO[] = turnData.attachments.map(
			(att) => ({
				mediaType: att.mediaType,
				mimeType: att.mimeType,
				name: att.name,
				sizeBytes: att.sizeBytes,
				url: att.url,
			}),
		);

		let participantProfile: RoomParticipantDTO | null = null;
		if (turnData.authorType === "participant" && turnData.room?.participants) {
			const matched = turnData.room.participants.find(
				(p) => p.id === turnData.authorId,
			);

			if (matched) {
				participantProfile = {
					id: matched.id,
					model: `${matched.provider}/${matched.model}`,
					name: matched.displayName,
				};
			}
		}

		const turnDTO: RoomTurnDTO = {
			id: turnData.id,
			content: turnData.content || "...",
			status: turnData.status,
			intent: turnData.intent,
			createdAt: turnData.createdAt.toISOString(),
			settledAt: turnData.settledAt ? turnData.settledAt.toISOString() : null,
			failedAt: turnData.failedAt ? turnData.failedAt.toISOString() : null,
			attachments,
			author: {
				type: turnData.authorType,
				profile: {
					moderator: null,
					participant: participantProfile,
				},
			},
			error:
				turnData.status === "failed" && turnData.errorKind
					? {
							kind: turnData.errorKind,
							message: turnData.errorMessage || "Turn generation failed",
							attributes: turnData.errorRetryAfter
								? { retryIn: turnData.errorRetryAfter }
								: null,
						}
					: null,
		};

		return { turn: turnDTO };
	}
}
