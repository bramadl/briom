import {
	type IntentOption,
	ModeratorId,
	ParticipantId,
	RoomId,
	type STREAM_ERROR,
	StreamError,
	Turn,
	TurnAuthor,
	TurnId,
	TurnPerspective,
	type TurnProps,
	TurnSequence,
	type TurnStatusOption,
} from "@briom/core/domain";

import type { TurnRecord } from "./turn.model";

const TurnAuthorMapper = {
	toDomain(record: TurnRecord): TurnAuthor {
		if (record.authorType === "moderator") {
			return TurnAuthor.asModerator(ModeratorId(record.moderatorId as string));
		}
		return TurnAuthor.asParticipant(
			ParticipantId(record.participantId as string),
		);
	},
};

export const TurnMapper = {
	toDomain(record: TurnRecord): Turn {
		const author = TurnAuthorMapper.toDomain(record);

		const props: TurnProps = {
			id: TurnId(record.id),
			roomId: RoomId(record.roomId),
			sequence: TurnSequence.fromNumber(record.sequence),
			author,
			intent: record.intent as IntentOption | null,
			perspective: TurnPerspective.empty(),
			status: record.status as TurnStatusOption,
			tokens: [],
			error: null,
			previousTurnId: record.previousTurnId
				? TurnId(record.previousTurnId)
				: null,
			createdAt: record.createdAt,
			settledAt: record.settledAt,
			failedAt: record.failedAt,
		};

		if (record.status === "settled" || record.status === "streaming") {
			props.perspective = TurnPerspective.rehydrate({
				content: record.content,
				renderedAt: record.settledAt,
			});
		}

		if (record.status === "failed" && record.failedAt && record.errorKind) {
			props.error = StreamError.rehydrate({
				kind: record.errorKind as (typeof STREAM_ERROR)[keyof typeof STREAM_ERROR],
				message: record.errorMessage || "Unknown error",
				occurredAt: record.failedAt,
				retryAfter: record.errorRetryAfter ?? undefined,
			});
		}

		return Turn.rehydrate(props);
	},

	toPersistence(turn: Turn): TurnRecord {
		const author = turn.get("author");
		const error = turn.get("error");

		return {
			id: turn.id.value(),
			roomId: turn.get("roomId").value(),
			sequence: turn.get("sequence").get("value"),
			authorType: author.isModerator ? "moderator" : "participant",
			moderatorId: author.moderatorId?.value() || null,
			participantId: author.participantId?.value() || null,
			intent: turn.get("intent"),
			content: turn.get("perspective").get("content"),
			status: turn.get("status"),
			previousTurnId: turn.get("previousTurnId")?.value() || null,
			errorKind: error?.get("kind") || null,
			errorMessage: error?.get("message") || null,
			errorRetryAfter: error?.get("retryAfter") || null,
			createdAt: turn.get("createdAt"),
			settledAt: turn.get("settledAt"),
			failedAt: turn.get("failedAt"),
		};
	},
};
