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

/**
 * @description
 * `TurnAuthorMapper` — Internal Mapper
 *
 * Reconstitutes `TurnAuthor` from database discriminated columns.
 */
const TurnAuthorMapper = {
	/**
	 * @description
	 * Creates `TurnAuthor` from database record.
	 *
	 * @param record - Turn row with authorType, moderatorId, participantId
	 * @returns `TurnAuthor` value object
	 */
	toDomain(record: TurnRecord): TurnAuthor {
		if (record.authorType === "moderator") {
			return TurnAuthor.asModerator(ModeratorId(record.moderatorId as string));
		}
		return TurnAuthor.asParticipant(
			ParticipantId(record.participantId as string),
		);
	},
};

/**
 * @description
 * `TurnMapper` — Infrastructure Mapper
 *
 * Translates between `Turn` aggregate and database records.
 * Handles the complex state-dependent reconstruction of `TurnPerspective`
 * and `StreamError` from flat database columns.
 *
 **State-Dependent Mapping**
 * - `SETTLED`/`STREAMING`: perspective content from `content` column
 * - `FAILED`: error from `errorKind`/`errorMessage`/`errorRetryAfter`/`failedAt`
 * - `PENDING`: empty perspective, no error
 * - `ABANDONED`: empty perspective, no error (terminal)
 */
export const TurnMapper = {
	/**
	 * @description
	 * Reconstitutes a `Turn` aggregate from database record.
	 *
	 * @param record - Raw turn row from database
	 * @returns Fully constructed `Turn` aggregate with correct state
	 */
	toDomain(record: TurnRecord): Turn {
		const props: TurnProps = {
			id: TurnId(record.id),
			roomId: RoomId(record.roomId),
			sequence: TurnSequence.fromNumber(record.sequence),
			author: TurnAuthorMapper.toDomain(record),
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

		// Reconstruct perspective for settled or streaming turns
		if (record.status === "settled" || record.status === "streaming") {
			props.perspective = TurnPerspective.rehydrate({
				content: record.content,
				renderedAt: record.settledAt,
			});
		}

		// Reconstruct error for failed turns
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

	/**
	 * @description
	 * Flattens a `Turn` aggregate into database record shape.
	 *
	 * @param turn - Domain aggregate to persist
	 * @returns Record suitable for `INSERT`/`UPDATE`
	 */
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
