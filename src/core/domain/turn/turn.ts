import {
	Aggregate,
	type DomainError,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { ModeratorId } from "../moderator";
import type { ParticipantId } from "../participant";
import type { RoomId } from "../room";

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
import { TurnAuthor } from "./turn.author";
import type { TurnId } from "./turn.id";
import { TurnIntent } from "./turn.intent";
import { TurnPerspective } from "./turn.perspective";
import type { TurnSequence } from "./turn.sequence";

interface TurnProps {
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

export class Turn extends Aggregate<TurnProps> {
	private constructor(props: TurnProps) {
		super(props);
	}

	public static override isValidProps(
		props: TurnProps,
	): DomainError | undefined {
		if (props.sequence.get("value") < 1) {
			return new NegativeSequenceError();
		}

		const author = props.author;
		if (author.isModerator && props.intent !== null) {
			return new InvalidAuthorError("Moderator turn cannot have intent");
		}
		if (author.isParticipant && props.intent === null) {
			return new MissingIntentError();
		}

		if (props.status === TURN_STATUS_OPTION.SETTLED) {
			const content = props.perspective.get("content");
			if (!content || content.trim().length === 0) {
				return new EmptyPerspectiveError();
			}
		}

		return undefined;
	}

	public static rehydrate(props: TurnProps): Turn {
		return new Turn(props);
	}

	public static initiateModeratorTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		moderatorId: ModeratorId;
		content: string;
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
		});

		if (result.isSuccess()) {
			const turn = result.value();
			turn.emit(
				new TurnInitiated(turn.id.value(), {
					authorType: "moderator",
					roomId: turn.get("roomId"),
					sequence: turn.get("sequence"),
					turnId: turn.id,
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
		});

		if (result.isSuccess()) {
			const turn = result.value();
			turn.emit(
				new TurnInitiated(turn.id.value(), {
					authorType: "participant",
					roomId: turn.get("roomId"),
					sequence: turn.get("sequence"),
					turnId: turn.id,
				}),
			);
		}

		return result;
	}

	public startStream(): IResult<void, InvalidStateTransitionError> {
		if (this.get("status") !== TURN_STATUS_OPTION.PENDING) {
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

	public accumulate(token: string): IResult<void, InvalidStateTransitionError> {
		if (this.get("status") !== TURN_STATUS_OPTION.STREAMING) {
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

	public settle(content: string): IResult<void, DomainError> {
		if (this.get("status") !== TURN_STATUS_OPTION.STREAMING) {
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

	public abandon(): IResult<void, InvalidStateTransitionError> {
		if (!this.isFailed) {
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

	public retry(newId: TurnId): IResult<Turn, DomainError> {
		if (!this.isFailed) {
			return Result.error(
				new InvalidStateTransitionError(
					this.get("status"),
					TURN_STATUS_OPTION.PENDING,
					"can only retry failed turns",
				),
			);
		}

		const author = this.get("author");
		if (!author.isParticipant) {
			return Result.error(
				new InvalidAuthorError("Only participant turns can be retried"),
			);
		}

		const participantId = author.participantId;
		if (!participantId) {
			return Result.error(new InvalidAuthorError("Participant ID missing"));
		}

		const intent = this.get("intent");
		if (!intent) {
			return Result.error(new MissingIntentError());
		}

		const result = Turn.initiateParticipantTurn({
			id: newId,
			roomId: this.get("roomId"),
			sequence: this.get("sequence"),
			participantId,
			intent: TurnIntent.from(intent),
			previousTurnId: this.get("id"),
		});

		if (result.isSuccess()) {
			this.emit(
				new TurnRetried(this.id.value(), {
					newTurnId: newId,
					previousTurnId: this.id,
				}),
			);
		}

		return result;
	}

	public get isPending(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.PENDING;
	}

	public get isStreaming(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.STREAMING;
	}

	public get isSettled(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.SETTLED;
	}

	public get isFailed(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.FAILED;
	}

	public get isAbandoned(): boolean {
		return this.get("status") === TURN_STATUS_OPTION.ABANDONED;
	}

	public get isFromModerator(): boolean {
		return this.get("author").isModerator;
	}

	public get isFromParticipant(): boolean {
		return this.get("author").isParticipant;
	}

	public get canRetry(): boolean {
		return this.isFailed;
	}

	public get canAbandon(): boolean {
		return this.isFailed;
	}

	public get participantId(): ParticipantId | null {
		return this.get("author").participantId;
	}

	public get moderatorId(): ModeratorId | null {
		return this.get("author").moderatorId;
	}

	public get currentContent(): string {
		if (this.isSettled) return this.get("perspective").get("content");
		if (this.isStreaming || this.isPending) return this.get("tokens").join("");
		return "";
	}
}
