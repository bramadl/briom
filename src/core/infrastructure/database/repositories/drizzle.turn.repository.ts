import {
	Attachment,
	CreditUsage,
	type ITurnRepository,
	ModeratorId,
	ParticipantId,
	type Room,
	RoomId,
	Turn,
	TurnAuthor,
	TurnError,
	TurnId,
	TurnSequence,
	TurnState,
} from "@briom/core/domain";
import type { DrizzleConn } from "@briom/drizzle/db";
import { turnsTable } from "@briom/drizzle/schema";

import { DrizzleBaseRepository } from "./drizzle.base.repository";

export class DrizzleTurnRepository
	extends DrizzleBaseRepository
	implements ITurnRepository
{
	private columns = {
		errorKind: true,
		errorMessage: true,
		errorRetryAfter: true,
		status: true,
		content: true,
		attachments: true,
		authorType: true,
		authorId: true,
		createdAt: true,
		id: true,
		intent: true,
		previousTurnId: true,
		roomId: true,
		sequence: true,
		usageCompletionTokens: true,
		usageCostUsd: true,
		usagePromptTokens: true,
		updatedAt: true,
	} as const;

	public constructor(private readonly db: DrizzleConn) {
		super();
	}

	public async findById(id: TurnId): Promise<Turn | null> {
		const turn = await this.db.query.turnsTable.findFirst({
			where: { id: id.value() },
			columns: this.columns,
		});

		if (!turn) return null;
		return this.mapToDomain(turn);
	}

	public async findByRoomId(roomId: RoomId): Promise<Turn[]> {
		const turns = await this.db.query.turnsTable.findMany({
			where: { roomId: roomId.value() },
			orderBy: { sequence: "asc" },
			columns: this.columns,
		});

		return turns.map((turn) => this.mapToDomain(turn));
	}

	public async getLatestTurnFrom(room: Room): Promise<Turn | null> {
		const turn = await this.db.query.turnsTable.findFirst({
			where: { roomId: room.id.value() },
			orderBy: { sequence: "desc" },
			columns: this.columns,
		});

		if (!turn) return null;
		return this.mapToDomain(turn);
	}

	public async persist(turn: Turn): Promise<void> {
		const record = this.mapToPersistence(turn);
		await this.db
			.insert(turnsTable)
			.values(record)
			.onConflictDoUpdate({
				target: turnsTable.id,
				set: this.without(record, ["id", "createdAt", "updatedAt"]),
			});
	}

	private mapToDomain(
		raw: Omit<
			typeof turnsTable.$inferSelect,
			"settledAt" | "failedAt" | "abortRequested"
		>,
	): Turn {
		const state = (() => {
			let turnError: TurnError;
			switch (raw.errorKind) {
				case "aborted":
					turnError = TurnError.aborted(raw.errorMessage ?? undefined);
					break;
				case "empty_response":
					turnError = TurnError.emptyResponse();
					break;
				case "model_not_found":
					turnError = TurnError.modelNotFound();
					break;
				case "rate_limited":
					turnError = TurnError.rateLimited(raw.errorRetryAfter ?? undefined);
					break;
				case "timeout":
					turnError = TurnError.timeout(raw.errorMessage ?? undefined);
					break;
				default:
					turnError = TurnError.streamFailure(raw.errorMessage ?? undefined);
					break;
			}

			switch (raw.status) {
				case "abandoned":
					return TurnState.abandoned();
				case "failed":
					return TurnState.failed(turnError, [raw.content ?? ""]);
				case "pending":
					return TurnState.pending();
				case "streaming":
					return TurnState.streaming([raw.content ?? ""]);
				default:
					return TurnState.settled(raw.content as string).value();
			}
		})();

		return Turn.init({
			attachments: raw.attachments.map((attachment) =>
				Attachment.init({
					content: attachment.content,
					mediaType: attachment.mediaType,
					mimeType: attachment.mimeType,
					name: attachment.name,
					sizeBytes: attachment.sizeBytes,
					url: attachment.url,
				}),
			),
			author: TurnAuthor.init({
				from: raw.authorType,
				id:
					raw.authorType === "moderator"
						? ModeratorId(raw.authorId)
						: ParticipantId(raw.authorId),
			}),
			createdAt: raw.createdAt,
			id: TurnId(raw.id),
			intent: raw.intent,
			previousTurnId: raw.previousTurnId ? TurnId(raw.previousTurnId) : null,
			roomId: RoomId(raw.roomId),
			sequence: TurnSequence.fromNumber(raw.sequence),
			state,
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
			updatedAt: raw.updatedAt,
		});
	}

	private mapToPersistence(turn: Turn): typeof turnsTable.$inferInsert {
		return {
			authorId: turn.authorId.value(),
			authorType: turn.get("author").get("from"),
			id: turn.id.value(),
			roomId: turn.get("roomId").value(),
			sequence: turn.get("sequence").get("value"),
			attachments: turn.get("attachments").map((attachment) => ({
				content: attachment.content,
				mediaType: attachment.mediaType,
				mimeType: attachment.mimeType,
				name: attachment.name,
				sizeBytes: attachment.sizeBytes,
				url: attachment.url,
			})),
			content: turn.get("state").currentContent,
			createdAt: turn.get("createdAt"),
			errorKind: turn.get("state").error?.kind ?? null,
			errorMessage: turn.get("state").error?.message ?? null,
			errorRetryAfter: turn.get("state").error?.retryAfter ?? null,
			failedAt: turn.get("state").failedAt,
			intent: turn.get("intent"),
			previousTurnId: turn.get("previousTurnId")?.value() ?? null,
			settledAt: turn.get("state").settledAt,
			status: turn.get("state").get("status"),
			updatedAt: turn.get("updatedAt"),
			usageCompletionTokens: turn.get("usage")?.completionTokens ?? null,
			usageCostUsd: turn.get("usage")?.costUsd ?? null,
			usagePromptTokens: turn.get("usage")?.promptTokens ?? null,
		};
	}
}
