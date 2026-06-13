import {
	type Orchestrator,
	ParticipantId,
	type ParticipantRepository,
	RoomId,
	RoomNotFoundError,
	type RoomRepository,
	type TurnRepository,
} from "@briom/domain";
import { type ICommand, type IResult, Result } from "@briom/drimion";

import type {
	RequestParticipantResponseCommand,
	RequestParticipantResponseErrors,
	RequestParticipantResponseOutput,
} from "./command";

export class RequestParticipantResponseHandler
	implements
		ICommand<
			RequestParticipantResponseCommand,
			RequestParticipantResponseOutput,
			RequestParticipantResponseErrors
		>
{
	public constructor(
		private readonly orchestrator: Orchestrator,
		private readonly roomRepository: RoomRepository,
		private readonly participantRepository: ParticipantRepository,
		private readonly turnRepository: TurnRepository,
	) {}

	public async execute({
		input,
	}: RequestParticipantResponseCommand): Promise<
		IResult<RequestParticipantResponseOutput, RequestParticipantResponseErrors>
	> {
		const roomId = RoomId(input.roomId);

		const room = await this.roomRepository.findById(roomId);
		if (!room) return Result.error(new RoomNotFoundError(input.roomId));

		const [participants, turns] = await Promise.all([
			this.participantRepository.findByRoom(roomId),
			this.turnRepository.findByRoom(roomId),
		]);

		const result = await this.orchestrator.orchestrate({
			room,
			participants,
			turns,
			targetParticipantId: ParticipantId(input.targetParticipantId),
			intent: input.intent,
		});

		if (result.isError()) return Result.error(result.error());

		const turn = result.value();
		await this.turnRepository.save(turn);

		return Result.success(turn);
	}
}
