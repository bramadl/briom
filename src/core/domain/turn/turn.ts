import {
	Aggregate,
	type DomainError,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { ModeratorId, RoomId } from "../room";
import type { ParticipantId } from "../room/participant";

import {
	EmptyPerspectiveError,
	InvalidAuthorError,
	InvalidStateTransitionError,
	MissingIntentError,
	NegativeSequenceError,
} from "./errors";
import {
	TurnAbandoned,
	TurnFailed,
	TurnInitiated,
	TurnRetried,
	TurnSettled,
	TurnStreamStarted,
	TurnTokenAccumulated,
} from "./events";
import {
	type IntentOption,
	TURN_STATUS_OPTION,
	type TurnStatusOption,
} from "./options";
import type { StreamError } from "./streams";
import type { TurnAttachment } from "./turn.attachment";
import { TurnAuthor } from "./turn.author";
import type { TurnId } from "./turn.id";
import type { TurnIntent } from "./turn.intent";
import { TurnPerspective } from "./turn.perspective";
import type { TurnSequence } from "./turn.sequence";

export interface TurnProps {
	attachments: TurnAttachment[];
	author: TurnAuthor;
	createdAt: Date;
	error: StreamError | null;
	failedAt: Date | null;
	id: TurnId;
	intent: IntentOption | null;
	perspective: TurnPerspective;
	previousTurnId: TurnId | null;
	roomId: RoomId;
	sequence: TurnSequence;
	settledAt: Date | null;
	status: TurnStatusOption;
	tokens: string[];
}

/**
 * @description
 * `Turn` — Aggregate Root
 *
 * A single contribution within a deliberation. The `Turn` is the atomic unit of
 * collaborative thinking: it has an author (moderator or participant), an intent
 * (why this contribution now), a perspective (the actual content), and a lifecycle
 * status that tracks its progression from initiation through streaming to settlement.
 *
 * **Lifecycle State Machine**
 * ```
 * `PENDING` → `STREAMING` → `SETTLED`
 *      ↓            ↓
 *  `FAILED` ←───────┘
 *      ↓
 * `ABANDONED`
 * ```
 *
 * **Attachments**
 * Moderator turns may carry up to the room's attachment limit worth of files.
 * The `Room` aggregate enforces the per-room count; `Turn` only enforces
 * that participant turns cannot have attachments.
 *
 * **Turn vs Message**
 * A `Turn` is NOT a message. A `Turn` carries intent, participates in a
 * deliberation, and has a stateful lifecycle. A message is a chat paradigm
 * concept — passive, stateless, and without purpose beyond transmission.
 *
 * **Ubiquitous Language**
 * - `Turn`: single contribution dalam deliberation (NOT "message", "response", "reply")
 * - `Intent`: purpose dari turn — mengapa participant ini speak sekarang?
 * - `Perspective`: the unique reasoning contribution (NOT "answer", "output", "generation")
 * - `Settle`: completing a turn after streaming (NOT "send", "submit")
 * - `Stream`: the process of accumulating tokens from an LLM (NOT "generate", "respond")
 * - `Attachment`: a file provided by the moderator to enrich shared context
 */
export class Turn extends Aggregate<TurnProps> {
	private constructor(props: TurnProps) {
		super(props);
	}

	/**
	 * @description
	 * Validates turn construction invariants:
	 * - Sequence must be ≥ 1
	 * - Moderator turns cannot have intent
	 * - Participant turns must have intent
	 * - Participant turns cannot have attachments
	 * - Settled turns must have non-empty perspective content
	 */
	public static override isValidProps(
		props: TurnProps,
	): DomainError | undefined {
		if (props.sequence.get("value") < 1) return new NegativeSequenceError();

		const author = props.author;

		if (author.isModerator && props.intent !== null) {
			return new InvalidAuthorError("Moderator turn cannot have intent");
		}

		if (author.isParticipant && props.intent === null) {
			return new MissingIntentError();
		}

		if (author.isParticipant && props.attachments.length > 0) {
			return new InvalidAuthorError(
				"Participant turns cannot carry attachments — only moderator turns can",
			);
		}

		if (props.status === TURN_STATUS_OPTION.SETTLED) {
			const content = props.perspective.get("content");
			if (!content || content.trim().length === 0) {
				return new EmptyPerspectiveError();
			}
		}

		return undefined;
	}

	/**
	 * @description
	 * Rehydrates a `Turn` from persistence. Does not emit events.
	 */
	public static rehydrate(props: TurnProps): Turn {
		return new Turn(props);
	}

	/**
	 * @description
	 * Factory for moderator turns.
	 *
	 * Moderator turns are immediately settled because the moderator's content
	 * is provided synchronously (no LLM streaming).
	 *
	 * Attachments are optional and default to an empty array. The caller
	 * (application layer) is responsible for ensuring the room's attachment
	 * count has capacity before passing attachments here.
	 *
	 * @param props - Turn properties including moderator ID, content, and optional attachments
	 * @returns Result containing the settled Turn or domain error
	 * @emits `TurnSettled` domain event.
	 * @emits `TurnInitiated` domain event.
	 */
	public static initiateModeratorTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		moderatorId: ModeratorId;
		content: string;
		attachments?: TurnAttachment[];
		clientTurnId?: string;
	}): IResult<Turn, DomainError> {
		const perspectiveResult = TurnPerspective.finalize(props.content);
		if (perspectiveResult.isError()) {
			return Result.error(perspectiveResult.error());
		}

		const result = Turn.create({
			id: props.id,
			roomId: props.roomId,
			sequence: props.sequence,
			author: TurnAuthor.asModerator(props.moderatorId),
			intent: null,
			perspective: perspectiveResult.value(),
			status: TURN_STATUS_OPTION.SETTLED,
			tokens: [],
			error: null,
			previousTurnId: null,
			createdAt: new Date(),
			settledAt: new Date(),
			failedAt: null,
			attachments: props.attachments ?? [],
		});

		if (result.isSuccess()) {
			const turn = result.value();
			turn.emit(
				new TurnInitiated(turn.id.value(), {
					authorType: "moderator",
					roomId: turn.get("roomId"),
					sequence: turn.get("sequence"),
					turnId: turn.id,
					moderatorId: props.moderatorId,
					participantId: null,
					intent: null,
					clientTurnId: props.clientTurnId ?? null,
				}),
			);
			turn.emit(
				new TurnSettled(turn.id.value(), {
					content: turn.get("perspective").get("content"),
					turnId: turn.id,
					roomId: turn.get("roomId"),
				}),
			);
		}

		return result;
	}

	/**
	 * @description
	 * Factory for participant turns.
	 *
	 * Participant turns start in `PENDING` status with no attachments.
	 * The LLM stream will later transition through `STREAMING` to `SETTLED`
	 * (or `FAILED`).
	 *
	 * @param props - Turn properties including participant ID and intent
	 * @returns Result containing the pending Turn or domain error
	 * @emits `TurnInitiated` domain event.
	 */
	public static initiateParticipantTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		participantId: ParticipantId;
		intent: TurnIntent;
		previousTurnId?: TurnId;
	}): IResult<Turn, DomainError> {
		const result = Turn.create({
			id: props.id,
			roomId: props.roomId,
			sequence: props.sequence,
			author: TurnAuthor.asParticipant(props.participantId),
			intent: props.intent.get("value"),
			perspective: TurnPerspective.empty(),
			status: TURN_STATUS_OPTION.PENDING,
			tokens: [],
			error: null,
			previousTurnId: props.previousTurnId ?? null,
			createdAt: new Date(),
			settledAt: null,
			failedAt: null,
			attachments: [],
		});

		if (result.isSuccess()) {
			const turn = result.value();
			turn.emit(
				new TurnInitiated(turn.id.value(), {
					authorType: "participant",
					roomId: turn.get("roomId"),
					sequence: turn.get("sequence"),
					turnId: turn.id,
					moderatorId: null,
					participantId: props.participantId,
					intent: props.intent.get("value"),
					clientTurnId: null,
				}),
			);
		}

		return result;
	}

	/**
	 * @description
	 * Whether this turn is awaiting stream start.
	 */
	public get isPending(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.PENDING;
	}

	/**
	 * @description
	 * Whether this turn is actively receiving tokens from LLM.
	 */
	public get isStreaming(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.STREAMING;
	}

	/**
	 * @description
	 * Whether this turn has completed with final perspective content.
	 */
	public get isSettled(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.SETTLED;
	}

	/**
	 * @description
	 * Whether this turn encountered an unrecoverable stream error.
	 */
	public get isFailed(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.FAILED;
	}

	/**
	 * @description
	 * Whether this turn was permanently abandoned after failure.
	 */
	public get isAbandoned(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.ABANDONED;
	}

	/**
	 * @description
	 * Whether this turn was authored by the moderator.
	 */
	public get isFromModerator(): boolean {
		return this.get("author").isModerator;
	}

	/**
	 * @description
	 * Whether this turn was authored by a participant.
	 */
	public get isFromParticipant(): boolean {
		return this.get("author").isParticipant;
	}

	/**
	 * @description
	 * Whether this failed turn can be retried.
	 */
	public get canRetry(): boolean {
		return this.isFailed;
	}

	/**
	 * @description
	 * Whether this failed turn can be abandoned.
	 */
	public get canAbandon(): boolean {
		return this.isFailed;
	}

	/**
	 * @description
	 * The participant ID if this is a participant turn, null otherwise.
	 */
	public get participantId(): ParticipantId | null {
		return this.get("author").participantId;
	}

	/**
	 * @description
	 * The moderator ID if this is a moderator turn, null otherwise.
	 */
	public get moderatorId(): ModeratorId | null {
		return this.get("author").moderatorId;
	}

	/**
	 * @description
	 * Whether this moderator turn has at least one file attached.
	 */
	public get hasAttachments(): boolean {
		return this.get("attachments").length > 0;
	}

	/**
	 * @description
	 * Returns the current perspective content based on status.
	 *
	 * - `SETTLED`: final perspective content
	 * - `STREAMING/PENDING`: accumulated tokens joined (partial content)
	 * - `FAILED/ABANDONED`: empty string
	 */
	public get currentContent(): string {
		if (this.isSettled) return this.get("perspective").get("content");
		if (this.isStreaming || this.isPending) return this.get("tokens").join("");
		return "";
	}

	/**
	 * @description
	 * Transitions from `PENDING` to `STREAMING`.
	 *
	 * **Invariant**: Must be in `PENDING` status.
	 * @emits `TurnStreamStarted` domain event.
	 */
	public startStream(): IResult<void, InvalidStateTransitionError> {
		if (!this.isPending) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.STREAMING,
					"can only start from pending",
				),
			);
		}

		this.change("status", TURN_STATUS_OPTION.STREAMING);

		this.emit(
			new TurnStreamStarted(this.id.value(), {
				turnId: this.id,
				roomId: this.get("roomId"),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Accumulates a token from the LLM stream into this turn's perspective.
	 *
	 * **Invariant**: Must be in `STREAMING` status.
	 * Updates the perspective incrementally from accumulated tokens.
	 *
	 * @param token - A chunk of text from the LLM response stream
	 * @emits `TurnTokenAccumulated` event for each token.
	 */
	public accumulate(token: string): IResult<void, InvalidStateTransitionError> {
		if (!this.isStreaming) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.STREAMING,
					"can only accumulate during streaming",
				),
			);
		}

		const currentTokens = this.get("tokens");
		this.change("tokens", [...currentTokens, token]);
		this.change(
			"perspective",
			TurnPerspective.fromTokens([...currentTokens, token]),
		);

		this.emit(
			new TurnTokenAccumulated(this.id.value(), {
				token,
				turnId: this.id,
				roomId: this.get("roomId"),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Finalizes the turn by transitioning from `STREAMING` to `SETTLED`.
	 *
	 * **Invariant**: Must be in `STREAMING` status.
	 * **Invariant**: Final content must be non-empty.
	 * Clears tokens (now persisted in perspective) and records settlement time.
	 *
	 * @param content - The complete, final perspective content
	 * @emits `TurnSettled` domain event.
	 */
	public settle(content: string): IResult<void, DomainError> {
		if (!this.isStreaming) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.SETTLED,
					"can only settle from streaming",
				),
			);
		}

		const perspectiveResult = TurnPerspective.finalize(content);
		if (perspectiveResult.isError()) {
			return Result.error(perspectiveResult.error());
		}

		this.change("status", TURN_STATUS_OPTION.SETTLED);
		this.change("perspective", perspectiveResult.value());
		this.change("tokens", []);
		this.change("settledAt", new Date());

		this.emit(
			new TurnSettled(this.id.value(), {
				content,
				turnId: this.id,
				roomId: this.get("roomId"),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Marks the turn as failed due to a stream error.
	 *
	 * **Invariant**: Must be in `PENDING` or `STREAMING` status.
	 * Records the error and failure timestamp. Clears partial tokens.
	 *
	 * @param error - The stream error that caused failure
	 * @emits `TurnFailed` domain event.
	 */
	public fail(error: StreamError): IResult<void, InvalidStateTransitionError> {
		if (!this.isPending && !this.isStreaming) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.FAILED,
					"can only fail from pending or streaming",
				),
			);
		}

		this.change("status", TURN_STATUS_OPTION.FAILED);
		this.change("error", error);
		this.change("failedAt", new Date());
		this.change("tokens", []);

		this.emit(
			new TurnFailed(this.id.value(), {
				error,
				turnId: this.id,
				roomId: this.get("roomId"),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Abandons a failed turn, permanently retiring it from the deliberation.
	 *
	 * **Invariant**: Must be in `FAILED` status.
	 * @emits `TurnAbandoned` domain event.
	 */
	public abandon(): IResult<void, InvalidStateTransitionError> {
		if (!this.canAbandon) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.ABANDONED,
					"can only abandon failed turns",
				),
			);
		}

		this.change("status", TURN_STATUS_OPTION.ABANDONED);

		this.emit(new TurnAbandoned(this.id.value(), { turnId: this.id }));

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Retries a failed turn by resetting it to `PENDING` status.
	 *
	 * **Invariant**: Must be in `FAILED` status.
	 * **Invariant**: Must be a participant turn (moderator turns are synchronous).
	 * Clears all error state and partial content.
	 *
	 * @emits `TurnRetried` domain event.
	 * @emits `TurnInitiated` domain events.
	 */
	public retry(): IResult<void, DomainError> {
		if (!this.canRetry) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.PENDING,
					"can only retry failed turns",
				),
			);
		}

		if (!this.isFromParticipant) {
			return Result.error(
				new InvalidAuthorError("Only participant turns can be retried"),
			);
		}

		this.change("status", TURN_STATUS_OPTION.PENDING);
		this.change("error", null);
		this.change("failedAt", null);
		this.change("tokens", []);
		this.change("perspective", TurnPerspective.empty());

		this.emit(
			new TurnRetried(this.id.value(), {
				turnId: this.id,
			}),
		);

		this.emit(
			new TurnInitiated(this.id.value(), {
				authorType: "participant",
				roomId: this.get("roomId"),
				sequence: this.get("sequence"),
				turnId: this.id,
				moderatorId: null,
				participantId: this.get("author").participantId,
				intent: this.get("intent"),
				clientTurnId: null,
			}),
		);

		return Result.success(undefined);
	}
}
