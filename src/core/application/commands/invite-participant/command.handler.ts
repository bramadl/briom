import {
	Participant,
	ParticipantId,
	ParticipantModel,
	ParticipantModelAi,
	ParticipantModelProvider,
	type ParticipantRepository,
	RoomId,
	type RoomRepository,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type {
	InviteParticipantCommand,
	InviteParticipantOutput,
} from "./command";

export class InviteParticipantHandler
	implements
		ICommand<InviteParticipantCommand, InviteParticipantOutput, DomainError>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly participantRepository: ParticipantRepository,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: InviteParticipantCommand,
	): Promise<IResult<InviteParticipantOutput, DomainError>> {
		const { roomId, displayName, model, provider } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "InviteParticipant" }),
			);
		}

		const participantId = ParticipantId();
		const participantResult = Participant.create({
			id: participantId,
			roomId: RoomId(roomId),
			displayName,
			model: ParticipantModel.create({
				model: ParticipantModelAi(model),
				provider: ParticipantModelProvider(provider),
			}).value(),
		});

		if (participantResult.isError()) {
			return Result.error(participantResult.error());
		}

		const participant = participantResult.value();
		const inviteResult = room.inviteParticipant(participantId);
		if (inviteResult.isError()) return Result.error(inviteResult.error());

		await this.participantRepository.persist(participant);
		await this.roomRepository.persist(room);

		const roomEvents = room.pullEvents();
		await this.eventBus.publishAll([...roomEvents]);

		return Result.success({ participantId: participantId.value() });
	}
}
