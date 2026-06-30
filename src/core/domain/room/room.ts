import {
	Aggregate,
	type DomainError,
	type IResult,
	Result,
	validator as v,
} from "@briom/libs/drimion";

import type { ModeratorId } from "../moderator/moderator.id";

import { CheckpointId } from "./checkpoint";
import {
	CannotConcludeRoomError,
	CannotFreezeRoomError,
	CannotLockRoomError,
	CannotStartDeliberationError,
	EmptyTitleError,
	EmptyTopicError,
	NotAcceptingTurnsError,
	ParticipantAlreadyInvitedError,
	ParticipateAfterDeliberationError,
} from "./errors";
import {
	CheckpointGenerated,
	CheckpointInitiated,
	DeliberationConcluded,
	DeliberationStarted,
	RoomFormed,
	RoomFrozen,
	RoomLocked,
	RoomUnfrozen,
	RoomUnlocked,
	TurnSlotClaimed,
	TurnSlotReleased,
} from "./events";
import type { Participant } from "./participant/participant";
import type { ParticipantId } from "./participant/participant.id";
import type { RoomId } from "./room.id";
import { RoomState } from "./room.state";
import { RoomStatus } from "./room.status";
import { TurnId } from "./turn/turn.id";
import { TurnSequence } from "./turn/turn.sequence";

interface RoomProps {
	/**
	 * @description
	 * The Turn currently claimed for in-flight contribution, or null when
	 * the room is open to accept the next turn. Set by `claimTurnSlot()`,
	 * cleared by `releaseTurnSlot()`. The single source of truth FE relies
	 * on (via `TurnSlotClaimed`/`TurnSlotReleased`) to know whether the
	 * moderator input, turn proposals, and retry actions should be enabled.
	 */
	activeTurnId: TurnId | null;

	/**
	 * @description
	 * Cumulative number of files attached across all moderator turns.
	 * Checked by the application layer against ModeratorPolicy before each upload.
	 */
	attachmentCount: number;

	/**
	 * @description
	 * Ordered list of Checkpoint IDs attached to this Room, oldest first.
	 * The renderer only ever needs the latest one (`latestCheckpointId`);
	 * the full list is kept for audit/debug tracing.
	 */
	checkpointIds: CheckpointId[];

	/**
	 * @description
	 * Stable branded type identity.
	 */
	id: RoomId;

	/**
	 * @description
	 * The Moderator who opened this Room. Immutable after formation.
	 */
	moderatorId: ModeratorId;

	/**
	 * @description
	 * AI models currently invited into the deliberation.
	 * Mutable only while FORMING.
	 */
	participants: Participant[];

	/**
	 * @description
	 * Why this Room currently rejects new turns, or null if it doesn't.
	 * Orthogonal to `status` — see `RoomState` for the distinction between
	 * a self-resolvable freeze and an admin-only lock.
	 */
	state: RoomState | null;

	/**
	 * @description
	 * Room status lifecycle: FORMING → DELIBERATING → CONCLUDED.
	 * State transitions are guarded by domain invariants in the Room aggregate.
	 */
	status: RoomStatus;

	/**
	 * @description
	 * Human-readable name for the Room.
	 */
	title: string;

	/**
	 * @description
	 * The central question driving deliberation.
	 * Null until deliberation starts.
	 */
	topic: string | null;

	/**
	 * @description
	 * Ordered list of Turn IDs registered in this Room.
	 * Source of truth for deliberation sequence.
	 */
	turnIds: TurnId[];
}

/**
 * @description
 * A dedicated thinking space where AI perspectives meet under human guidance.
 *
 * Room is the consistency boundary for all deliberation state: who is invited,
 * what the topic is, how many files have been shared, and where in the lifecycle
 * the deliberation stands.
 *
 * Lifecycle: FORMING → DELIBERATING → CONCLUDED
 *
 * **What Room governs:**
 * - Participant invitation and removal (while FORMING)
 * - Topic setting and deliberation start
 * - Turn registration
 * - Attachment count tracking
 * - Status transitions
 * - Turn slot ownership (who may contribute right now)
 * - Lock/freeze state (whether the room currently accepts turns at all)
 *
 * **What Room does NOT govern:**
 * - Whether a Moderator is allowed to form another room → ModeratorPolicy
 * - Whether a Moderator is allowed to invite more participants → ModeratorPolicy
 * - Whether a Moderator is allowed to attach more files → ModeratorPolicy
 * - Turn content, streaming, or LLM calls → Turn domain
 * - Who should speak next and with what intent → RoomDeliberationService
 */
export class Room extends Aggregate<RoomProps> {
	private constructor(props: RoomProps) {
		super(props);
	}

	public static override isValidProps(
		props: RoomProps,
	): DomainError | undefined {
		if (v.string(props.title).isEmpty()) return new EmptyTitleError();
	}

	/**
	 * @description
	 * Opens a new Room in FORMING status, ready for participant invitations.
	 *
	 * @emits RoomFormed
	 */
	public static form(
		props: Omit<
			RoomProps,
			| "turnIds"
			| "status"
			| "attachmentCount"
			| "topic"
			| "activeTurnId"
			| "checkpointIds"
			| "lock"
		>,
	): IResult<Room, DomainError> {
		const fullProps: RoomProps = {
			...props,
			activeTurnId: null,
			attachmentCount: 0,
			checkpointIds: [],
			state: null,
			status: RoomStatus.FORMING,
			topic: null,
			turnIds: [],
		};

		const error = Room.isValidProps(fullProps);
		if (error) return Result.error(error);

		const room = new Room(fullProps);
		room.emit(
			new RoomFormed(room.id.value(), {
				roomId: room.id,
				occurredAt: new Date(),
			}),
		);

		return Result.success(room);
	}

	/**
	 * @description
	 * Participants are being invited. Deliberation has not begun.
	 */
	public get isForming(): boolean {
		return this.get("status") === RoomStatus.FORMING;
	}

	/**
	 * @description
	 * Topic is set, turns are flowing. Active deliberation in progress.
	 */
	public get isDeliberating(): boolean {
		return this.get("status") === RoomStatus.DELIBERATING;
	}

	/**
	 * @description
	 * Returns true if the room has no turns registered before.
	 */
	public get isFresh(): boolean {
		return this.get("turnIds").length === 0;
	}

	/**
	 * @description
	 * True if the Room can claim a new turn slot right now — not locked,
	 * and no other turn is currently in flight. The single condition FE
	 * needs to decide whether to enable the moderator input.
	 */
	public get isAcceptingTurns(): boolean {
		return (
			!this.isLocked && !this.isFrozen && this.get("activeTurnId") === null
		);
	}

	/**
	 * @description
	 * True if this Room currently is in frozen state.
	 */
	public get isFrozen(): boolean {
		return this.state !== null && this.state.kind === "frozen";
	}

	/**
	 * @description
	 * True if this Room currently has a lock applied.
	 */
	public get isLocked(): boolean {
		return this.state !== null && this.state.kind === "locked";
	}

	/**
	 * @description
	 * The current state detail, or null if the Room has no state.
	 * FE reads `state.reason` for display and `state.isSelfResolvable`
	 * to decide whether to show a "top up" call-to-action.
	 */
	public get state(): RoomState | null {
		return this.get("state");
	}

	/**
	 * @description
	 * Deliberation has ended. Room is read-only.
	 */
	public get isConcluded(): boolean {
		return this.get("status") === RoomStatus.CONCLUDED;
	}

	/**
	 * @description
	 * True if at least one Participant has been invited.
	 */
	public get hasParticipants(): boolean {
		return this.get("participants").length > 0;
	}

	/**
	 * @description
	 * Number of Participants currently in the Room.
	 */
	public get participantCount(): number {
		return this.get("participants").length;
	}

	/**
	 * @description
	 * Number of files attached across all moderator turns in this Room.
	 */
	public get attachmentCount(): number {
		return this.get("attachmentCount");
	}

	/**
	 * @description
	 * Returns the next sequence of a turn.
	 *
	 * Caller has to call this before invoking `room.registerTurn`.
	 */
	public get nextSequence(): TurnSequence {
		return TurnSequence.fromNumber(this.get("turnIds").length + 1);
	}

	/**
	 * @description
	 * The most recently attached Checkpoint ID, or null if none exist yet.
	 */
	public get latestCheckpointId(): CheckpointId | null {
		const ids = this.get("checkpointIds");
		return ids.length > 0 ? ids[ids.length - 1] : null;
	}

	/**
	 * @description
	 * Which checkpoint generation comes next — 1 if none exist yet.
	 */
	public get nextCheckpointIteration(): number {
		return this.get("checkpointIds").length + 1;
	}

	/**
	 * @description
	 * Renames the Room. Allowed at any lifecycle stage.
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
	 * Returns the Participant, or undefined if not found.
	 */
	public findParticipant(participant: Participant): Participant | undefined {
		return this.get("participants").find(
			(p) =>
				p.id.isEqual(participant.id) ||
				p.qualifiedModel === participant.qualifiedModel,
		);
	}

	/**
	 * @description
	 * Returns the Participant by the given ID, or undefined if not found.
	 */
	public findParticipantById(
		participantId: ParticipantId,
	): Participant | undefined {
		return this.get("participants").find((p) => p.id.isEqual(participantId));
	}

	/**
	 * @description
	 * Invites an AI model into the Room as a named Participant.
	 * Only allowed while FORMING. Duplicate model or ID is rejected.
	 *
	 * Caller must verify ModeratorPolicy.canInviteParticipant() first.
	 */
	public inviteParticipant(
		participant: Participant,
	): IResult<
		void,
		ParticipateAfterDeliberationError | ParticipantAlreadyInvitedError
	> {
		if (!this.isForming) {
			return Result.error(new ParticipateAfterDeliberationError());
		}

		const duplicate = this.findParticipant(participant);
		if (duplicate) return Result.error(new ParticipantAlreadyInvitedError());

		this.change("participants", [...this.get("participants"), participant]);
		return Result.success(undefined);
	}

	/**
	 * @description
	 * Removes a Participant from the Room.
	 * Only allowed while FORMING — deliberation locks the roster.
	 */
	public uninviteParticipant(
		participantId: ParticipantId,
	): IResult<void, DomainError> {
		if (!this.isForming) {
			return Result.error(new ParticipateAfterDeliberationError());
		}

		this.change(
			"participants",
			this.get("participants").filter((p) => !p.id.isEqual(participantId)),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Sets the topic and transitions the Room into active deliberation.
	 * Requires at least one Participant to be present.
	 *
	 * @emits DeliberationStarted
	 */
	public deliberate(
		topic: string,
	): IResult<void, EmptyTopicError | CannotStartDeliberationError> {
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

		if (v.string(topic).isEmpty()) return Result.error(new EmptyTopicError());

		this.change("topic", topic);
		this.change("status", RoomStatus.DELIBERATING);

		this.emit(
			new DeliberationStarted(this.id.value(), {
				roomId: this.id,
				topic,
				occurredAt: new Date(),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Claims the Room's turn slot for a new contribution, generating and
	 * returning a fresh `TurnId` in the same step. Callers (the orchestrating
	 * command handler) pass this ID straight into `Turn.initiateModeratorTurn`
	 * or `Turn.initiateParticipantTurn` — the Turn never needs to invent its
	 * own identity, and FE that receives the ID from the command response
	 * never has to swap an optimistic ID for a server-issued one.
	 *
	 * Fails if the Room is locked/frozen or another turn is already in flight —
	 * this is the single gate that prevents two turns from being processed
	 * concurrently, whether from a legitimate sequential flow or a FE race.
	 *
	 * Pass `{ silent: true }` for claims that are purely an internal
	 * implementation detail of a single orchestration step (e.g. the
	 * moderator-turn claim that resolves synchronously before the
	 * participant-turn claim that follows it) — FE has no use for an event
	 * about a slot that opens and closes within the same command.
	 *
	 * @emits TurnSlotClaimed
	 */
	public claimTurnSlot(options?: {
		silent?: boolean;
	}): IResult<TurnId, NotAcceptingTurnsError> {
		if (!this.isAcceptingTurns) {
			return Result.error(new NotAcceptingTurnsError());
		}

		const turnId = TurnId();
		this.change("activeTurnId", turnId);

		if (!options?.silent) {
			this.emit(
				new TurnSlotClaimed(this.id.value(), {
					roomId: this.id,
					turnId,
					occurredAt: new Date(),
				}),
			);
		}

		return Result.success(turnId);
	}

	/**
	 * @description
	 * Releases the Room's turn slot, allowing the next slot to be claimed.
	 * Called once a Turn reaches a terminal state (settled, or
	 * failed-and-abandoned).
	 *
	 * Pass `{ silent: true }` for the same reason as `claimTurnSlot` —
	 * to suppress the event for internal release/claim pairs that carry
	 * no signal FE needs to act on.
	 *
	 * @emits TurnSlotReleased
	 */
	public releaseTurnSlot(options?: { silent?: boolean }): void {
		this.change("activeTurnId", null);

		if (!options?.silent) {
			this.emit(
				new TurnSlotReleased(this.id.value(), {
					roomId: this.id,
					occurredAt: new Date(),
				}),
			);
		}
	}

	/**
	 * @description
	 * Records a Turn ID into the Room's deliberation history.
	 * No event emitted — Turn domain owns turn lifecycle events.
	 */
	public registerTurn(turnId: TurnId): void {
		this.change("turnIds", [...this.get("turnIds"), turnId]);
	}

	/**
	 * @description
	 * Increments the attachment counter.
	 * Caller must verify ModeratorPolicy.canAttachFile() first.
	 */
	public registerAttachment(): void {
		this.change("attachmentCount", this.get("attachmentCount") + 1);
	}

	/**
	 * @description
	 * Tells the Room that a Checkpoint is about to be generated, returning
	 * a pre-generated `CheckpointId`. Callers use this ID to instantiate the
	 * `Checkpoint` entity directly, mirroring the claim-before-create pattern
	 * used by `claimTurnSlot` — the entity never has to invent its own
	 * identity mid-flow.
	 *
	 * @emits CheckpointInitiated
	 */
	public initiateCheckpoint(): IResult<CheckpointId, never> {
		const checkpointId = CheckpointId();

		this.emit(
			new CheckpointInitiated(this.id.value(), {
				roomId: this.id,
				checkpointId,
				occurredAt: new Date(),
			}),
		);

		return Result.success(checkpointId);
	}

	/**
	 * @description
	 * Attaches a newly generated Checkpoint to the Room's history.
	 * Called by the application layer after a Checkpoint has been successfully
	 * generated and persisted.
	 *
	 * @emits CheckpointGenerated
	 */
	public attachCheckpoint(checkpointId: CheckpointId): void {
		this.change("checkpointIds", [...this.get("checkpointIds"), checkpointId]);

		this.emit(
			new CheckpointGenerated(this.id.value(), {
				roomId: this.id,
				checkpointId,
				occurredAt: new Date(),
			}),
		);
	}

	/**
	 * @description
	 * Applies a lock to the Room, immediately preventing new turns from
	 * being claimed (`isAcceptingTurns` becomes false). Only an actively
	 * deliberating Room can be locked.
	 *
	 * @emits RoomLocked
	 */
	public lockRoom(reason: string): IResult<void, CannotLockRoomError> {
		if (!this.isDeliberating) return Result.error(new CannotLockRoomError());

		this.change("state", RoomState.locked(reason));

		this.emit(
			new RoomLocked(this.id.value(), {
				roomId: this.id,
				kind: "locked",
				reason,
				occurredAt: new Date(),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Lifts the Room's current lock, if any, allowing turns to be claimed
	 * again. Called after an admin clears a moderation lock.
	 *
	 * @emits RoomUnlocked
	 */
	public unlockRoom(): void {
		if (this.state && this.state.kind !== "locked") return;

		this.change("state", null);

		this.emit(
			new RoomUnlocked(this.id.value(), {
				roomId: this.id,
				occurredAt: new Date(),
			}),
		);
	}

	/**
	 * @description
	 * Freezes the Room, immediately preventing new turns from
	 * being claimed (`isAcceptingTurns` becomes false). Only an actively
	 * deliberating Room can be frozen.
	 *
	 * @emits RoomFrozen
	 */
	public freezeRoom(reason: string): IResult<void, CannotFreezeRoomError> {
		if (!this.isDeliberating) return Result.error(new CannotFreezeRoomError());

		this.change("state", RoomState.frozen(reason));

		this.emit(
			new RoomFrozen(this.id.value(), {
				roomId: this.id,
				kind: "frozen",
				reason,
				occurredAt: new Date(),
			}),
		);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Unfroze the Room's current state, if any, allowing turns to be claimed
	 * again. Called after a moderator self-resolves a freeze (e.g. tops up
	 * credits).
	 *
	 * @emits RoomUnfrozen
	 */
	public unfrozeRoom(): void {
		if (this.state && this.state.kind !== "frozen") return;

		this.change("state", null);

		this.emit(
			new RoomUnfrozen(this.id.value(), {
				roomId: this.id,
				occurredAt: new Date(),
			}),
		);
	}

	/**
	 * @description
	 * Concludes the deliberation. Room becomes permanently read-only.
	 *
	 * @emits DeliberationConcluded
	 */
	public conclude(): IResult<void, CannotConcludeRoomError> {
		if (!this.isDeliberating) {
			return Result.error(
				new CannotConcludeRoomError(
					this.isConcluded
						? "Room is already concluded"
						: "Only an active deliberation can be concluded",
				),
			);
		}

		this.change("status", RoomStatus.CONCLUDED);

		this.emit(
			new DeliberationConcluded(this.id.value(), {
				roomId: this.id,
				occurredAt: new Date(),
			}),
		);

		return Result.success(undefined);
	}
}
