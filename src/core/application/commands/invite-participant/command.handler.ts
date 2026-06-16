import {
	AiModel,
	AiProvider,
	Participant,
	ParticipantId,
	type ParticipantRepository,
	RoomId,
	RoomNotFoundError,
	type RoomRepository,
} from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/drimion";

import type {
	InviteParticipantCommand,
	InviteParticipantOutput,
} from "./command";

export class InviteParticipantHandler
	implements
		ICommand<
			InviteParticipantCommand,
			InviteParticipantOutput,
			RoomNotFoundError | DomainError
		>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly participantRepository: ParticipantRepository,
	) {}

	public async execute({
		input,
	}: InviteParticipantCommand): Promise<
		IResult<InviteParticipantOutput, RoomNotFoundError | DomainError>
	> {
		const roomId = RoomId(input.roomId);

		const room = await this.roomRepository.findById(roomId);
		if (!room) return Result.error(new RoomNotFoundError(input.roomId));

		const participantResult = Participant.create({
			id: ParticipantId(crypto.randomUUID()),
			roomId,
			provider: AiProvider(input.provider),
			model: AiModel(input.model),
			displayName: input.displayName,
		});

		if (participantResult.isError()) {
			return Result.error(participantResult.error());
		}

		const participant = participantResult.value();
		await this.participantRepository.save(participant);

		return Result.success({ participantId: participant.id.value() });
	}
}
