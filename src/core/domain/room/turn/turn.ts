import { Aggregate, type DomainError, type IResult, Result } from "@drimion";

import type { CreditUsage } from "../../moderator/credit/credit.usage";
import type { ModeratorId } from "../../moderator/moderator.id";
import type { ParticipantId } from "../participant/participant.id";
import type { RoomId } from "../room.id";

import type { Attachment } from "./attachment/attachment";
import { EmptyPerspectiveError } from "./errors/empty-perspective.error";
import { InvalidAuthorError } from "./errors/invalid-author.error";
import { InvalidStateTransitionError } from "./errors/invalid-state-transition.error";
import { MissingIntentError } from "./errors/missing-intent.error";
import { NegativeSequenceError } from "./errors/negative-sequence.error";
import { TurnAbandoned } from "./events/turn-abandoned.event";
import { TurnFailed } from "./events/turn-failed.event";
import { TurnInitiated } from "./events/turn-initiated.event";
import { TurnRetried } from "./events/turn-retried.event";
import { TurnSettled } from "./events/turn-settled.event";
import { TurnStreamStarted } from "./events/turn-stream-started.event";
import { TurnTokenAccumulated } from "./events/turn-token-accumulated.event";
import { TurnAuthor } from "./turn.author";
import type { TurnError } from "./turn.error";
import type { TurnId } from "./turn.id";
import { TurnIntent } from "./turn.intent";
import type { TurnSequence } from "./turn.sequence";
import { TurnState } from "./turn.state";

interface TurnProps {
	/**
	 * @description
	 * Files shared alongside a moderator turn. Always empty for participant turns.
	 */
	attachments: Attachment[];

	/**
	 * @description
	 * Who contributed this turn — the moderator or a participant.
	 */
	author: TurnAuthor;

	/**
	 * @description
	 * When this turn was first initiated.
	 */
	createdAt: Date;

	/**
	 * @description
	 * Stable identity for this turn.
	 */
	id: TurnId;

	/**
	 * @description
	 * null for moderator turns — intent only applies to participant contributions.
	 */
	intent: TurnIntent | null;

	/**
	 * @description
	 * null for moderator turns or the first turn in a room.
	 */
	previousTurnId: TurnId | null;

	/**
	 * @description
	 * The Room this turn belongs to.
	 */
	roomId: RoomId;

	/**
	 * @description
	 * Ordinal position of this turn within the room's deliberation.
	 */
	sequence: TurnSequence;

	/**
	 * @description
	 * Current lifecycle state — pending, streaming, settled, failed, or abandoned.
	 */
	state: TurnState;

	/**
	 * @description
	 * null until the turn settles — only participant turns carry usage.
	 */
	usage: CreditUsage | null;
}

/**
 * @description
 * A single contribution within a deliberation.
 *
 * Turn is the atomic unit of collaborative thinking: it has an author
 * (moderator or participant), an intent (why this contribution now, for
 * participants), and a lifecycle that tracks its progress from initiation
 * through streaming to settlement.
 *
 * Lifecycle: PENDING → STREAMING → SETTLED
 *                 ↓         ↓
 *              FAILED ←─────┘
 *                 ↓
 *             ABANDONED
 *
 * A Turn is not a message — it carries intent, participates in deliberation,
 * and has a stateful lifecycle. A message is passive and stateless; a Turn
 * is a deliberate act within an evolving conversation.
 */
export class Turn extends Aggregate<TurnProps> {
	private constructor(props: TurnProps) {
		super(props);
	}

	public static override isValidProps(
		props: TurnProps,
	):
		| NegativeSequenceError
		| InvalidAuthorError
		| MissingIntentError
		| undefined {
		if (props.sequence.get("value") < 1) return new NegativeSequenceError();

		if (props.author.isModerator && props.intent !== null) {
			return new InvalidAuthorError("Moderator turn cannot have intent");
		}

		if (props.author.isParticipant && props.intent === null) {
			return new MissingIntentError();
		}

		if (props.author.isParticipant && props.attachments.length > 0) {
			return new InvalidAuthorError(
				"Participant turns cannot carry attachments — only moderator turns can",
			);
		}
	}

	/**
	 * @description
	 * Opens a moderator turn. Settled immediately — moderator content is
	 * provided synchronously, with no LLM streaming involved.
	 *
	 * @emits TurnInitiated
	 * @emits TurnSettled
	 */
	public static initiateModeratorTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		moderatorId: ModeratorId;
		content: string;
		attachments?: Attachment[];
	}): IResult<
		Turn,
		| NegativeSequenceError
		| InvalidAuthorError
		| MissingIntentError
		| EmptyPerspectiveError
	> {
		if (!props.content || props.content.trim().length === 0) {
			return Result.error(new EmptyPerspectiveError());
		}

		const settledResult = TurnState.settled(props.content.trim());
		if (settledResult.isError()) return Result.error(settledResult.error());

		const result = Turn.create({
			id: props.id,
			roomId: props.roomId,
			sequence: props.sequence,
			author: TurnAuthor.fromModerator(props.moderatorId),
			intent: null,
			state: settledResult.value(),
			attachments: props.attachments ?? [],
			previousTurnId: null,
			usage: null,
			createdAt: new Date(),
		});

		if (result.isSuccess()) {
			const turn = result.value();

			turn.emit(
				new TurnInitiated(turn.id.value(), {
					roomId: turn.get("roomId"),
					turnId: turn.id,
					sequence: turn.get("sequence"),
					authorType: "moderator",
				}),
			);

			turn.emit(
				new TurnSettled(turn.id.value(), {
					roomId: turn.get("roomId"),
					turnId: turn.id,
					content: props.content.trim(),
				}),
			);
		}

		return result;
	}

	/**
	 * @description
	 * Opens a participant turn in PENDING status, awaiting LLM stream.
	 *
	 * @emits TurnInitiated
	 */
	public static initiateParticipantTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		participantId: ParticipantId;
		intent: TurnIntent;
		previousTurnId?: TurnId;
	}): IResult<
		Turn,
		NegativeSequenceError | InvalidAuthorError | MissingIntentError
	> {
		const result = Turn.create({
			id: props.id,
			roomId: props.roomId,
			sequence: props.sequence,
			author: TurnAuthor.fromParticipant(props.participantId),
			intent: props.intent,
			state: TurnState.pending(),
			attachments: [],
			previousTurnId: props.previousTurnId ?? null,
			usage: null,
			createdAt: new Date(),
		});

		if (result.isSuccess()) {
			const turn = result.value();
			turn.emit(
				new TurnInitiated(turn.id.value(), {
					roomId: turn.get("roomId"),
					turnId: turn.id,
					sequence: turn.get("sequence"),
					authorType: "participant",
				}),
			);
		}

		return result;
	}

	/**
	 * @description
	 * The ModeratorId or ParticipantId of whoever authored this turn.
	 */
	public get authorId(): ModeratorId | ParticipantId {
		return this.get("author").id;
	}

	/**
	 * @description
	 * The ModeratorId if authored by moderator, null otherwise.
	 * Prefer checking isModerator first for type-safe narrowing.
	 */
	public get moderatorId(): ModeratorId | null {
		return this.get("author").moderatorId;
	}

	/**
	 * @description
	 * The ParticipantId if authored by participant, null otherwise.
	 * Prefer checking isParticipant first for type-safe narrowing.
	 */
	public get participantId(): ParticipantId | null {
		return this.get("author").participantId;
	}

	/**
	 * @description
	 * Whether this author is the human moderator.
	 */
	public get isFromModerator(): boolean {
		return this.get("author").isModerator;
	}

	/**
	 * @description
	 * Whether this author is an AI participant.
	 */
	public get isFromParticipant(): boolean {
		return this.get("author").isParticipant;
	}

	/**
	 * @description
	 * Wether the state of this turn is pending.
	 */
	public get isPending(): boolean {
		return this.get("state").isPending;
	}

	/**
	 * @description
	 * Wether the state of this turn is streaming.
	 */
	public get isStreaming(): boolean {
		return this.get("state").isStreaming;
	}

	/**
	 * @description
	 * Wether the state of this turn is settled.
	 */
	public get isSettled(): boolean {
		return this.get("state").isSettled;
	}

	/**
	 * @description
	 * Wether the state of this turn is failed.
	 */
	public get isFailed(): boolean {
		return this.get("state").isFailed;
	}

	/**
	 * @description
	 * Wether the state of this turn is abandoned.
	 */
	public get isAbandoned(): boolean {
		return this.get("state").isAbandoned;
	}

	/**
	 * @description
	 * Question assumptions or conclusions.
	 */
	public get isToChallenge(): boolean {
		return this.get("intent") === TurnIntent.CHALLENGE;
	}

	/**
	 * @description
	 * Offer critical perspective on recent reasoning.
	 */
	public get isToCritique(): boolean {
		return this.get("intent") === TurnIntent.CRITIQUE;
	}

	/**
	 * @description
	 * Respond directly to the moderator's request.
	 */
	public get isToDirect(): boolean {
		return this.get("intent") === TurnIntent.DIRECT;
	}

	/**
	 * @description
	 * Add depth, nuance, or alternative angles.
	 */
	public get isToExpand(): boolean {
		return this.get("intent") === TurnIntent.EXPAND;
	}

	/**
	 * @description
	 * Continue the discussion naturally, building on previous perspectives.
	 */
	public get isToRespond(): boolean {
		return this.get("intent") === TurnIntent.RESPOND;
	}

	/**
	 * @description
	 * Synthesize where the deliberation stands.
	 */
	public get isToSummarize(): boolean {
		return this.get("intent") === TurnIntent.SUMMARIZE;
	}

	/**
	 * @description
	 * True if this turn failed in a way the moderator may retry — only
	 * ever true for participant turns, since moderator turns settle
	 * synchronously and never enter the FAILED state.
	 */
	public get canRetry(): boolean {
		return this.isFailed && this.isFromParticipant;
	}

	/**
	 * @description
	 * True if this turn is in a PENDING or STREAMING state and can be
	 * permanently retired via `abandon()`.
	 */
	public get canAbort(): boolean {
		return this.isPending || this.isStreaming;
	}

	/**
	 * @description
	 * True if this turn is in a FAILED state and can be permanently
	 * retired via `abandon()`. Distinct from `canRetry` — abandonment
	 * doesn't require participant authorship, though in practice only
	 * participant turns ever reach FAILED.
	 */
	public get canAbandon(): boolean {
		return this.isFailed;
	}

	/**
	 * @description
	 * True if this turn (always a moderator turn — see
	 * `Turn.isValidProps`) carries at least one file attachment.
	 */
	public get hasAttachments(): boolean {
		return this.get("attachments").length > 0;
	}

	/**
	 * @description
	 * Stream error detail. Only meaningful when isFailed.
	 */
	public get streamError(): TurnError | null {
		return this.get("state").error;
	}

	/**
	 * @description
	 * Current readable content regardless of status.
	 * Streaming: joined tokens. Settled: final content. Otherwise: empty string.
	 */
	public get currentContent(): string {
		return this.get("state").currentContent;
	}

	/**
	 * @description
	 * Begins active token accumulation.
	 *
	 * @emits TurnStreamStarted
	 */
	public startStream(): IResult<void, InvalidStateTransitionError> {
		if (!this.isPending) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("state").get("status"),
					"streaming",
					"can only start from pending",
				),
			);
		}

		this.change("state", TurnState.streaming());

		this.emit(
			new TurnStreamStarted(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Accumulates a token chunk from the LLM stream.
	 *
	 * @emits TurnTokenAccumulated
	 */
	public accumulate(token: string): IResult<void, InvalidStateTransitionError> {
		if (!this.isStreaming) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("state").get("status"),
					"streaming",
					"can only accumulate during streaming",
				),
			);
		}

		const tokens = [...this.get("state").tokens, token];
		this.change("state", TurnState.streaming(tokens));

		this.emit(
			new TurnTokenAccumulated(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
				token,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Finalizes the turn with complete content and usage metadata.
	 *
	 * @emits TurnSettled
	 */
	public settle(
		content: string,
		usage: CreditUsage,
	): IResult<void, DomainError> {
		if (!this.isStreaming) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("state").get("status"),
					"settled",
					"can only settle from streaming",
				),
			);
		}

		const settledResult = TurnState.settled(content);
		if (settledResult.isError()) return Result.error(settledResult.error());

		this.change("state", settledResult.value());
		this.change("usage", usage);

		this.emit(
			new TurnSettled(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
				content,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Marks the turn as failed due to a stream error.
	 *
	 * @emits TurnFailed
	 */
	public fail(error: TurnError): IResult<void, InvalidStateTransitionError> {
		if (!this.isPending && !this.isStreaming) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("state").get("status"),
					"failed",
					"can only fail from pending or streaming",
				),
			);
		}

		const existingTokens = this.get("state").tokens;
		this.change("state", TurnState.failed(error, existingTokens));

		this.emit(
			new TurnFailed(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
				error,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Permanently retires a failed turn from the deliberation.
	 * Used when a moderator chooses to skip a turn that kept failing
	 * (e.g. persistent rate limits on a free model) rather than retry.
	 *
	 * @emits TurnAbandoned
	 */
	public abandon(): IResult<void, InvalidStateTransitionError> {
		if (!this.canAbandon) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("state").get("status"),
					"abandoned",
					"can only abandon failed turns",
				),
			);
		}

		this.change("state", TurnState.abandoned());

		this.emit(
			new TurnAbandoned(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Resets a failed participant turn back to PENDING for another attempt.
	 *
	 * @emits TurnRetried
	 * @emits TurnInitiated
	 */
	public retry(): IResult<void, DomainError> {
		if (!this.isFailed) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("state").get("status"),
					"pending",
					"can only retry failed turns",
				),
			);
		}

		if (!this.isFromParticipant) {
			return Result.error(
				new InvalidAuthorError("Only participant turns can be retried"),
			);
		}

		this.change("state", TurnState.pending());

		this.emit(
			new TurnRetried(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
			}),
		);

		this.emit(
			new TurnInitiated(this.id.value(), {
				roomId: this.get("roomId"),
				turnId: this.id,
				sequence: this.get("sequence"),
				authorType: "participant",
			}),
		);

		return Result.success(undefined);
	}
}
