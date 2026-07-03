import {
	type IModeratorRepository,
	type IRoomRepository,
	type Moderator,
	ModeratorId,
	ModeratorPolicy,
	Participant,
	ParticipantId,
	ParticipantModel,
	ParticipantModelAi,
	ParticipantModelProvider,
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
	InviteParticipantCommand,
	InviteParticipantOutput,
} from "./command";

/**
 * @description
 * Application-layer command handler responsible for inviting a new
 * Participant into an existing Room.
 *
 * Resolves the Room, verifies moderator ownership, validates the
 * participant model, enforces room status constraints (FORMING only),
 * and persists the updated Room aggregate.
 */
export class InviteParticipantHandler
	implements
		ICommand<
			InviteParticipantCommand,
			InviteParticipantOutput,
			ApplicationError
		>
{
	public constructor(
		private readonly moderatorRepository: IModeratorRepository,
		private readonly roomRepository: IRoomRepository,
	) {}

	public async execute({
		input,
	}: InviteParticipantCommand): Promise<
		IResult<InviteParticipantOutput, ApplicationError>
	> {
		const moderatorId = ModeratorId(input.moderatorId);
		const roomId = RoomId(input.roomId);

		const roomResult = await this.resolveAuthorizedRoom(roomId, moderatorId);
		if (roomResult.isError()) return Result.error(roomResult.error());
		const { moderator, room } = roomResult.value();

		const guardResult = this.guardInvitationPolicy(moderator, room);
		if (guardResult.isError()) return Result.error(guardResult.error());

		const participantResult = this.buildParticipant(input);
		if (participantResult.isError()) {
			return Result.error(participantResult.error());
		}

		const participant = participantResult.value();
		const invitationResult = this.inviteIntoRoom(room, participant);
		if (invitationResult.isError()) {
			return Result.error(invitationResult.error());
		}

		await this.roomRepository.persist(room);

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
	): Promise<IResult<{ moderator: Moderator; room: Room }, ApplicationError>> {
		const moderator = await this.moderatorRepository.findById(moderatorId);
		if (!moderator) {
			return Result.error(ApplicationError.notFound("Room not found"));
		}

		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode("ROOM_NOT_FOUND"),
			);
		}

		if (!room.get("moderatorId").isEqual(moderatorId)) {
			return Result.error(ApplicationError.forbidden());
		}

		return Result.success({ moderator, room });
	}

	/**
	 * @description
	 * Enforce Moderator Policy on inviting participant.
	 */
	private guardInvitationPolicy(
		moderator: Moderator,
		room: Room,
	): IResult<void, ApplicationError> {
		const policy = new ModeratorPolicy(moderator);

		const canInvite = policy.canInviteParticipant(room.participantCount);
		if (!canInvite) {
			return Result.error(
				ApplicationError.forbidden(
					"You have reached the maximum number of participants in this room.",
				).withCode("ROOM_PARTICIPANTS_LIMIT_REACHED"),
			);
		}

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Lorem ipsum dolot sit amet.
	 */
	private buildParticipant(props: {
		displayName: string;
		model: string;
		provider: string;
	}): IResult<Participant, ApplicationError> {
		const modelResult = ParticipantModel.create({
			model: ParticipantModelAi(props.model),
			provider: ParticipantModelProvider(props.provider),
		});

		if (modelResult.isError()) {
			const domainError = modelResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		const participantResult = Participant.create({
			displayName: props.displayName,
			id: ParticipantId(),
			model: modelResult.value(),
		});

		if (participantResult.isError()) {
			const domainError = participantResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		const participant = participantResult.value();
		return Result.success(participant);
	}

	/**
	 * @description
	 * Invites the participant into the room.
	 */
	private inviteIntoRoom(
		room: Room,
		participant: Participant,
	): IResult<void, ApplicationError> {
		const inviteResult = room.inviteParticipant(participant);
		if (inviteResult.isError()) {
			const domainError = inviteResult.error();
			return Result.error(
				ApplicationError.badRequest(domainError.message).causedBy(domainError),
			);
		}

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Shapes the handler's outcome into the response FE renders.
	 */
	private buildOutput(participant: Participant): InviteParticipantOutput {
		return {
			participantId: participant.id.value(),
			displayName: participant.displayName,
			qualifiedModel: participant.qualifiedModel,
		};
	}
}
