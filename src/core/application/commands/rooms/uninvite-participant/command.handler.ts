import {
	type IRoomRepository,
	ModeratorId,
	type Participant,
	ParticipantId,
	type Room,
	RoomId,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IResult,
	Result,
} from "@drimion";

import type {
	UninviteParticipantCommand,
	UninviteParticipantOutput,
} from "./command";

/**
 * @description
 * Application-layer command handler responsible for uninviting a
 * Participant from an existing Room.
 *
 * Resolves the Room, verifies moderator ownership, resolves the
 * participant by ID, delegates removal to the domain, and persists.
 */
export class UninviteParticipantHandler
	implements
		ICommand<
			UninviteParticipantCommand,
			UninviteParticipantOutput,
			ApplicationError
		>
{
	public constructor(private readonly roomRepository: IRoomRepository) {}

	public async execute({
		input,
	}: UninviteParticipantCommand): Promise<
		IResult<UninviteParticipantOutput, ApplicationError>
	> {
		const roomId = RoomId(input.roomId);
		const moderatorId = ModeratorId(input.moderatorId);

		const roomResult = await this.resolveAuthorizedRoom(roomId, moderatorId);
		if (roomResult.isError()) return Result.error(roomResult.error());
		const room = roomResult.value();

		const participantId = ParticipantId(input.participantId);
		const uninviteResult = this.uninviteFromRoom(room, participantId);
		if (uninviteResult.isError()) return Result.error(uninviteResult.error());

		await this.roomRepository.persist(room);

		const participant = uninviteResult.value();
		const output = this.buildOutput(participant);
		return Result.success(output);
	}

	/**
	 * @description
	 * Loads the Room and verifies the acting Moderator owns it.
	 */
	private async resolveAuthorizedRoom(
		roomId: RoomId,
		moderatorId: ModeratorId,
	): Promise<IResult<Room, ApplicationError>> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode("ROOM_NOT_FOUND"),
			);
		}

		if (!room.get("moderatorId").isEqual(moderatorId)) {
			return Result.error(ApplicationError.forbidden());
		}

		return Result.success(room);
	}

	/**
	 * @description
	 * Remove participant from the room.
	 *
	 * @returns
	 * The participant being uninvited.
	 */
	private uninviteFromRoom(
		room: Room,
		participantId: ParticipantId,
	): IResult<Participant, ApplicationError> {
		const participant = room.findParticipantById(participantId);
		if (!participant) {
			return Result.error(
				ApplicationError.notFound("Participant not found in this room"),
			);
		}

		const uninviteResult = room.uninviteParticipant(participant.id);
		if (uninviteResult.isError()) {
			const domainError = uninviteResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		return Result.success(participant);
	}

	/**
	 * @description
	 * Shapes the handler's outcome into the response FE renders.
	 */
	private buildOutput(participant: Participant): UninviteParticipantOutput {
		return {
			participantId: participant.id.value(),
		};
	}
}
