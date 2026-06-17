import {
	Aggregate,
	type DomainError,
	type IResult,
	Result,
	validator as v,
} from "@briom/drimion";

import type { ModeratorId } from "../moderator";
import type { ParticipantId } from "../participant";
import type { TurnId } from "../turn";

import {
	CannotConcludeRoomError,
	CannotPauseRoomError,
	CannotResumeRoomError,
	CannotStartDeliberationError,
	EmptyTitleError,
	EmptyTopicError,
	ParticipantAlreadyInvitedError,
	ParticipateAfterDeliberation,
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
import type { RoomId } from "./room.id";
import { ROOM_STATUS_OPTION, type RoomStatusOption } from "./room.status";

interface RoomProps {
	createdAt: Date;
	id: RoomId;
	moderatorId: ModeratorId;
	participantIds: ParticipantId[];
	status: RoomStatusOption;
	title: string;
	topic: string | null;
	turnIds: TurnId[];
}

export class Room extends Aggregate<RoomProps> {
	private constructor(props: RoomProps) {
		super(props);
	}

	public static override isValidProps(
		props: RoomProps,
	): DomainError | undefined {
		if (v.string(props.title).isEmpty()) return new EmptyTitleError();
		return undefined;
	}

	public static form(
		props: Omit<RoomProps, "topic" | "participantIds" | "turnIds" | "status">,
	): IResult<Room, EmptyTitleError> {
		const fullProps: RoomProps = {
			...props,
			topic: null,
			participantIds: [],
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

	public get isDeliberating(): boolean {
		return this.get("status") === ROOM_STATUS_OPTION.DELIBERATING;
	}

	public inviteParticipant(
		participantId: ParticipantId,
	): IResult<
		void,
		ParticipateAfterDeliberation | ParticipantAlreadyInvitedError
	> {
		if (this.get("status") !== ROOM_STATUS_OPTION.FORMING) {
			return Result.error(new ParticipateAfterDeliberation());
		}

		const current = this.get("participantIds");
		if (current.some((id) => id === participantId)) {
			return Result.error(new ParticipantAlreadyInvitedError());
		}

		this.change("participantIds", [...current, participantId]);
		this.emit(
			new ParticipantInvited(this.id.value(), {
				participantId,
				occurredAt: new Date(),
				roomId: this.id,
			}),
		);
		return Result.success(undefined);
	}

	public startDeliberation(
		topic: string,
	): IResult<void, EmptyTopicError | CannotStartDeliberationError> {
		if (v.string(topic).isEmpty()) {
			return Result.error(new EmptyTopicError());
		}

		if (this.get("status") !== ROOM_STATUS_OPTION.FORMING) {
			return Result.error(
				new CannotStartDeliberationError("Room is not in forming status"),
			);
		}

		if (this.get("participantIds").length === 0) {
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

	public pause(): IResult<void, CannotPauseRoomError> {
		if (this.get("status") !== ROOM_STATUS_OPTION.DELIBERATING) {
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

	public resume(): IResult<void, CannotResumeRoomError> {
		if (this.get("status") !== ROOM_STATUS_OPTION.PAUSED) {
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

	public conclude(): IResult<void, CannotConcludeRoomError> {
		if (
			this.get("status") !== ROOM_STATUS_OPTION.DELIBERATING &&
			this.get("status") !== ROOM_STATUS_OPTION.PAUSED
		) {
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

	public rename(newTitle: string): IResult<void, EmptyTitleError> {
		if (v.string(newTitle).isEmpty()) {
			return Result.error(new EmptyTitleError());
		}

		this.change("title", newTitle);
		return Result.success(undefined);
	}
}
