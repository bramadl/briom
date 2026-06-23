import {
	Aggregate,
	type DomainError,
	type IResult,
	Result,
	validator as v,
} from "@briom/drimion";

import type { TurnId } from "../turn";

import {
	CannotConcludeRoomError,
	CannotPauseRoomError,
	CannotResumeRoomError,
	CannotStartDeliberationError,
	EmptyTitleError,
	EmptyTopicError,
	MaximumParticipantReachedError,
	ParticipantAlreadyInvitedError,
	ParticipateAfterDeliberationError,
} from "./errors";
import {
	DeliberationConcluded,
	DeliberationPaused,
	DeliberationResumed,
	DeliberationStarted,
	ParticipantInvited,
	RoomFormed,
	TurnRegistered,
} from "./events";
import type { ModeratorId } from "./moderator.id";
import type { Participant, ParticipantId } from "./participant";
import type { RoomId } from "./room.id";
import { ROOM_STATUS_OPTION, type RoomStatusOption } from "./room.status";

interface RoomProps {
	createdAt: Date;
	id: RoomId;
	moderatorId: ModeratorId;
	participants: Participant[];
	status: RoomStatusOption;
	title: string;
	topic: string | null;
	turnIds: TurnId[];
}

/**
 * @description
 * `Room` — Aggregate Root
 *
 * A dedicated thinking space where deliberation occurs. The `Room` is the consistency
 * boundary for all deliberation state: participants, turns, status lifecycle, and topic.
 *
 * **Lifecycle**
 * ```
 * `FORMING` → `DELIBERATING` → [`PAUSED`] → `CONCLUDED`
 * ```
 *
 * **Why this matters**
 * The `Room` protects the invariant that deliberation is human-led and sequential.
 * It enforces that participants are invited before deliberation starts, that turns
 * are registered in order, and that state transitions (pause, resume, conclude)
 * follow valid paths.
 *
 * **Ubiquitous Language**
 * - `Room`: dedicated thinking space (NOT "chat", "conversation", "thread")
 * - `Deliberation`: the ongoing process of evolving perspectives through sequential turns
 * - `Participant`: invited AI model with identity (NOT "bot", "agent")
 * - `Moderator`: human user who guides deliberation (NOT "admin", "owner")
 * - `Turn`: single contribution within deliberation (NOT "message", "response")
 *
 * @example
 * ```typescript
 * const room = Room.form({
 *   id: RoomId(),
 *   title: "Architecture Decision",
 *   moderatorId: ModeratorId("user-123"),
 *   createdAt: new Date(),
 * }).value();
 *
 * room.inviteParticipant(gptParticipant);
 * room.startDeliberation("Should we use CQRS?");
 * room.registerTurn(turn.id);
 * room.pause();
 * room.resume();
 * room.conclude();
 * ```
 */
export class Room extends Aggregate<RoomProps> {
	private readonly MAXIMUM_PARTICIPANTS = 4;

	private constructor(props: RoomProps) {
		super(props);
	}

	/**
	 * @description
	 * Validates that a `Room` can be constructed with the given props.
	 * Enforces: title must be non-empty.
	 */
	public static override isValidProps(
		props: RoomProps,
	): DomainError | undefined {
		if (v.string(props.title).isEmpty()) return new EmptyTitleError();
		return undefined;
	}

	/**
	 * @description
	 * Factory method for creating a new `Room` in `FORMING` status.
	 *
	 * @param props - `Room` properties excluding derived defaults (topic, participants, turnIds, status)
	 * @returns Result containing the new `Room` or `EmptyTitleError`
	 * @emits `RoomFormed` domain event.
	 */
	public static form(
		props: Omit<RoomProps, "topic" | "participants" | "turnIds" | "status">,
	): IResult<Room, EmptyTitleError> {
		const fullProps: RoomProps = {
			...props,
			topic: null,
			participants: [],
			turnIds: [],
			status: ROOM_STATUS_OPTION.FORMING,
		};

		const validation = Room.isValidProps(fullProps);
		if (validation) return Result.error(validation);

		const room = new Room(fullProps);
		room.emit(
			new RoomFormed(room.id.value(), {
				moderatorId: room.get("moderatorId"),
				occurredAt: new Date(),
				roomId: room.id,
			}),
		);
		return Result.success(room);
	}

	/**
	 * @description
	 * Rehydrates from persistence. Does not emit domain events.
	 */
	public static rehydrate(props: RoomProps): Room {
		return new Room(props);
	}

	/**
	 * @description
	 * Whether the `Room` is awaiting for deliberation.
	 */
	public get isForming(): boolean {
		return this.get("status") === ROOM_STATUS_OPTION.FORMING;
	}

	/**
	 * @description
	 * Whether the `Room` is actively deliberating (not paused, not concluded, not forming).
	 * Used by application layer to guard turn initiation.
	 */
	public get isDeliberating(): boolean {
		return this.get("status") === ROOM_STATUS_OPTION.DELIBERATING;
	}

	/**
	 * @description
	 * Whether the `Room` is paused by moderator.
	 */
	public get isPaused(): boolean {
		return this.get("status") === ROOM_STATUS_OPTION.PAUSED;
	}

	/**
	 * @description
	 * Whether the `Room` has reached maximum participants
	 */
	public get isMaximumParticipantsReached(): boolean {
		return this.get("participants").length === this.MAXIMUM_PARTICIPANTS;
	}

	/**
	 * @description
	 * Whether the `Room` has participants.
	 */
	public get hasParticipants(): boolean {
		return this.get("participants").length > 0;
	}

	/**
	 * @description
	 * Finds a participant by their ID within this room's participant list.
	 */
	public findParticipantById(participantId: ParticipantId) {
		return this.get("participants").find((p) => p.id.isEqual(participantId));
	}

	/**
	 * @description
	 * Invites a participant into the room.
	 *
	 * **Invariant**: For MVP, maximum of 4 participants can be invited
	 *
	 * **Invariant**: Can only invite while `FORMING`. Once deliberation starts,
	 * the participant set is frozen to preserve deliberation context integrity.
	 *
	 * **Invariant**:
	 * - Duplicate participants (by ID) are rejected.
	 * - Duplicate participant models (by qualified model) are rejected.
	 *
	 * @param participant - The AI participant to invite
	 * @returns Result containing void or domain error
	 */
	public inviteParticipant(
		participantToInvite: Participant,
	): IResult<
		void,
		ParticipateAfterDeliberationError | ParticipantAlreadyInvitedError
	> {
		if (!this.isForming) {
			return Result.error(new ParticipateAfterDeliberationError());
		}

		if (this.isMaximumParticipantsReached) {
			return Result.error(new MaximumParticipantReachedError());
		}

		const currentParticipants = this.get("participants");
		const invitedParticipant = currentParticipants.find(
			(p) =>
				participantToInvite.id.isEqual(p.id) ||
				participantToInvite.qualifiedModel.includes(p.qualifiedModel),
		);

		if (invitedParticipant) {
			return Result.error(new ParticipantAlreadyInvitedError());
		}

		this.change("participants", [...currentParticipants, participantToInvite]);

		this.emit(
			new ParticipantInvited(this.id.value(), {
				participantId: participantToInvite.id,
				model: participantToInvite.get("model").model,
				provider: participantToInvite.get("model").provider,
				name: participantToInvite.get("displayName"),
				qualifiedModel: participantToInvite.qualifiedModel,
				occurredAt: new Date(),
				roomId: this.id,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Starts deliberation by setting a topic and transitioning to `DELIBERATING`.
	 *
	 * **Invariant**: Room must be in `FORMING` status.
	 * **Invariant**: Topic must be non-empty.
	 * **Invariant**: At least one participant must be invited.
	 *
	 * @param topic - The subject of deliberation introduced by the moderator
	 * @emits `DeliberationStarted` domain event.
	 */
	public startDeliberation(
		topic: string,
	): IResult<void, EmptyTopicError | CannotStartDeliberationError> {
		if (v.string(topic).isEmpty()) {
			return Result.error(new EmptyTopicError());
		}

		if (!this.isForming) {
			return Result.error(
				new CannotStartDeliberationError("Room is not in forming status"),
			);
		}

		if (!this.hasParticipants) {
			return Result.error(
				new CannotStartDeliberationError(
					"Cannot start deliberation without participants",
				),
			);
		}

		this.change("topic", topic);
		this.change("status", ROOM_STATUS_OPTION.DELIBERATING);

		this.emit(
			new DeliberationStarted(this.id.value(), {
				occurredAt: new Date(),
				roomId: this.id,
				topic,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Registers a turn within this room's deliberation history.
	 *
	 * Maintains the ordered sequence of turn IDs for shared context reconstruction.
	 *
	 * @param turnId - The ID of the turn to register
	 * @emits `TurnRegistered` domain event.
	 */
	public registerTurn(turnId: TurnId): void {
		this.change("turnIds", [...this.get("turnIds"), turnId]);
		this.emit(
			new TurnRegistered(this.id.value(), {
				occurredAt: new Date(),
				roomId: this.id,
				turnId,
			}),
		);
	}

	/**
	 * @description
	 * Pauses an active deliberation.
	 *
	 * **Invariant**: `Room` must be `DELIBERATING`.
	 * @emits `DeliberationPaused` domain event.
	 */
	public pause(): IResult<void, CannotPauseRoomError> {
		if (!this.isDeliberating) {
			return Result.error(new CannotPauseRoomError());
		}

		this.change("status", ROOM_STATUS_OPTION.PAUSED);

		this.emit(
			new DeliberationPaused(this.id.value(), {
				occurredAt: new Date(),
				roomId: this.id,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Resumes a paused deliberation.
	 *
	 * **Invariant**: `Room` must be `PAUSED`.
	 * @emits `DeliberationResumed` domain event.
	 */
	public resume(): IResult<void, CannotResumeRoomError> {
		if (!this.isPaused) {
			return Result.error(new CannotResumeRoomError());
		}

		this.change("status", ROOM_STATUS_OPTION.DELIBERATING);

		this.emit(
			new DeliberationResumed(this.id.value(), {
				occurredAt: new Date(),
				roomId: this.id,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Concludes deliberation, ending the thinking session.
	 *
	 * **Invariant**: `Room` must be `DELIBERATING` or `PAUSED`.
	 * @emits `DeliberationConcluded` domain event.
	 */
	public conclude(): IResult<void, CannotConcludeRoomError> {
		if (!this.isDeliberating && !this.isPaused) {
			return Result.error(new CannotConcludeRoomError());
		}

		this.change("status", ROOM_STATUS_OPTION.CONCLUDED);

		this.emit(
			new DeliberationConcluded(this.id.value(), {
				occurredAt: new Date(),
				roomId: this.id,
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Renames the room.
	 *
	 * **Invariant**: Title must be non-empty.
	 */
	public rename(newTitle: string): IResult<void, EmptyTitleError> {
		if (v.string(newTitle).isEmpty()) {
			return Result.error(new EmptyTitleError());
		}

		this.change("title", newTitle);
		return Result.success(undefined);
	}
}
