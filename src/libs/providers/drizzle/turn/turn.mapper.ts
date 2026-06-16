import { ParticipantId } from "@briom/domain/participant";
import { RoomId } from "@briom/domain/room";
import type { TurnStatus } from "@briom/domain/turn";
import { Intent, Turn, TurnId } from "@briom/domain/turn";
import type { TurnRecord } from "@briom/drizzle/schema";

export const TurnMapper = {
	toDomain(record: TurnRecord): Turn {
		const result = Turn.create({
			id: TurnId(record.id),
			roomId: RoomId(record.roomId),
			sequenceNumber: record.sequenceNumber,
			author:
				record.authorType === "user"
					? { type: "user" }
					: {
							type: "participant",
							participantId: ParticipantId(record.participantId as string),
						},
			intent: record.intent ? Intent(record.intent) : undefined,
			content: record.content,
			status: (record.status ?? "settled") as TurnStatus,
			createdAt: record.createdAt,
		});

		if (result.isError()) throw result.error();
		return result.value();
	},

	toPersistence(turn: Turn): TurnRecord {
		const author = turn.get("author");
		return {
			id: turn.id.value(),
			roomId: turn.get("roomId") as string,
			sequenceNumber: turn.get("sequenceNumber"),
			authorType: author.type,
			participantId:
				author.type === "participant" ? (author.participantId as string) : null,
			intent: turn.get("intent") ?? null,
			content: turn.get("content"),
			status: turn.get("status"),
			createdAt: turn.get("createdAt"),
		};
	},
};
