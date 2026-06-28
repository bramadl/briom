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
	CannotSynthesizeError,
	EmptyTitleError,
	EmptyTopicError,
	MaximumAttachmentsReachedError,
	MaximumParticipantReachedError,
	NoSynthesisInProgressError,
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
import type { ModeratorId } from "./moderator/moderator.id";
import type { Participant, ParticipantId } from "./participant";
import { RoomAttachmentPolicy } from "./room.attachment";
import type { RoomId } from "./room.id";
import { ROOM_STATUS_OPTION, type RoomStatusOption } from "./room.status";
import type { SynthesisProcess } from "./synthesis/process";

interface RoomProps {
	attachmentCount: number;
	createdAt: Date;
	id: RoomId;
	moderatorId: ModeratorId;
	participants: Participant[];
	status: RoomStatusOption;
	synthesis: string | null;
	synthesisCreatedAt: Date | null;
	synthesisCreatedBy: string | null;
	synthesisStatus: SynthesisProcess;
	title: string;
	topic: string | null;
	turnIds: TurnId[];
}

/**
 * @description
 * `Room` — Aggregate Root
 *
 * A dedicated thinking space where deliberation occurs. The `Room` is the consistency
 * boundary for all deliberation state: participants, turns, status lifecycle, topic,
 * and file attachment quota.
 *
 * **Lifecycle**
 * ```
 * `FORMING` → `DELIBERATING` → [`PAUSED`] → `CONCLUDED`
 * ```
 *
 * **Attachment quota**
 * The room tracks a cumulative `attachmentCount` across all moderator turns.
 * `registerAttachment()` enforces the ceiling defined by `RoomAttachmentPolicy`
 * before the application layer persists any new attachment. This keeps the
 * invariant inside the aggregate where it belongs.
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
 * - `Attachment`: a file provided by the moderator to enrich shared context
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
 * room.registerAttachment().orThrow(); // guard before persisting file
 * room.registerTurn(turn.id);
 * room.pause();
 * room.resume();
 * room.conclude();
 * ```
 */
export class Room extends Aggregate<RoomProps> {
	private readonly MAXIMUM_PARTICIPANTS = 4;
	private readonly attachmentPolicy = new RoomAttachmentPolicy();

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
	 * @param props - `Room` properties excluding derived defaults
	 * @returns Result containing the new `Room` or `EmptyTitleError`
	 * @emits `RoomFormed` domain event.
	 */
	public static form(
		props: Omit<
			RoomProps,
			"topic" | "participants" | "turnIds" | "status" | "attachmentCount"
		>,
	): IResult<Room, EmptyTitleError> {
		const fullProps: RoomProps = {
			...props,
			topic: null,
			participants: [],
			turnIds: [],
			attachmentCount: 0,
			status: ROOM_STATUS_OPTION.FORMING,
			synthesis: null,
			synthesisStatus: "idle",
			synthesisCreatedAt: null,
			synthesisCreatedBy: null,
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
	 * Whether the `Room` is concluded by moderator.
	 */
	public get isConcluded(): boolean {
		return this.get("status") === ROOM_STATUS_OPTION.CONCLUDED;
	}

	/**
	 * @description
	 * Whether the `Room` has reached maximum participants.
	 */
	public get isMaximumParticipantsReached(): boolean {
		return this.get("participants").length === this.MAXIMUM_PARTICIPANTS;
	}

	/**
	 * @description
	 * Whether the `Room` is in synthesizing process.
	 */
	public get isSynthesizing(): boolean {
		return this.get("synthesisStatus") === "pending";
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
	 * Whether the moderator can still attach more files to this room.
	 * Checked by the application layer before accepting an upload.
	 */
	public get canAttachMore(): boolean {
		return !this.attachmentPolicy.isRoomLimitReached(
			this.get("attachmentCount"),
		);
	}

	/**
	 * @description
	 * How many more files can be attached to this room.
	 * Useful for UI indicators ("1 attachment slot remaining").
	 */
	public get remainingAttachmentSlots(): number {
		return this.attachmentPolicy.remaining(this.get("attachmentCount"));
	}

	// ─── Queries ──────────────────────────────────────────────────────────────

	public findParticipantById(participantId: ParticipantId) {
		return this.get("participants").find((p) => p.id.isEqual(participantId));
	}

	// ─── Mutations ────────────────────────────────────────────────────────────

	/**
	 * @description
	 * Registers a file attachment slot against the room's quota.
	 *
	 * **Call this before persisting the attachment** — if this returns an error,
	 * the upload should be rejected and the file should not be stored.
	 *
	 * The `count` parameter defaults to 1. Pass the number of files being
	 * attached in a single moderator turn (currently always 1 per attachment).
	 *
	 * **Invariant**: Total `attachmentCount` across the room cannot exceed
	 * `RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM`.
	 *
	 * @returns Result void or `MaximumAttachmentsReachedError`
	 */
	public registerAttachment(
		count = 1,
	): IResult<void, MaximumAttachmentsReachedError> {
		const current = this.get("attachmentCount");

		if (
			this.attachmentPolicy.isRoomLimitReached(current) ||
			current + count > RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM
		) {
			return Result.error(new MaximumAttachmentsReachedError());
		}

		this.change("attachmentCount", current + count);
		return Result.success(undefined);
	}

	/**
	 * @description
	 * Invites a participant into the room.
	 *
	 * **Invariant**: Max 4 participants.
	 * **Invariant**: Can only invite while `FORMING`.
	 * **Invariant**: No duplicate IDs or models.
	 *
	 * @emits `ParticipantInvited` domain event.
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
		const alreadyInvited = currentParticipants.find(
			(p) =>
				participantToInvite.id.isEqual(p.id) ||
				participantToInvite.qualifiedModel.includes(p.qualifiedModel),
		);

		if (alreadyInvited) {
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
	 * **Invariant**: `FORMING` status, non-empty topic, ≥1 participant.
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
	 * **Invariant**: `DELIBERATING` or `PAUSED`, not already `CONCLUDED`.
	 * @emits `DeliberationConcluded` domain event.
	 */
	public conclude(): IResult<void, CannotConcludeRoomError> {
		if (this.isConcluded) {
			return Result.error(
				new CannotConcludeRoomError("Room is already concluded"),
			);
		}

		if (!this.isDeliberating && !this.isPaused) {
			return Result.error(
				new CannotConcludeRoomError(
					"Can only conclude active or paused deliberation",
				),
			);
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
	 * **Invariant**: Title must be non-empty.
	 */
	public rename(newTitle: string): IResult<void, EmptyTitleError> {
		if (v.string(newTitle).isEmpty()) {
			return Result.error(new EmptyTitleError());
		}

		this.change("title", newTitle);
		return Result.success(undefined);
	}

	/**
	 * @description
	 * Starts the synthesis process.
	 *
	 * **Invariant**: `CONCLUDED`, no synthesis already in-flight.
	 */
	public initiateSynthesis(): IResult<void, CannotSynthesizeError> {
		if (!this.isConcluded) {
			return Result.error(
				new CannotSynthesizeError(
					"Can only synthesize concluded deliberations",
				),
			);
		}

		if (this.isSynthesizing) {
			return Result.error(
				new CannotSynthesizeError("Synthesis already in progress"),
			);
		}

		this.change("synthesisStatus", "pending");
		this.change("synthesis", null);
		this.change("synthesisCreatedAt", null);
		this.change("synthesisCreatedBy", null);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Saves a completed synthesis.
	 * **Invariant**: A synthesis must be in-flight.
	 */
	public saveSynthesis(
		content: string,
		createdBy: string,
	): IResult<void, DomainError> {
		if (!this.isSynthesizing) {
			return Result.error(new NoSynthesisInProgressError());
		}

		this.change("synthesis", content);
		this.change("synthesisStatus", "completed");
		this.change("synthesisCreatedAt", new Date());
		this.change("synthesisCreatedBy", createdBy);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Marks an in-flight synthesis as failed.
	 */
	public failSynthesis(): void {
		if (this.isSynthesizing) {
			this.change("synthesisStatus", "failed");
		}
	}
}
