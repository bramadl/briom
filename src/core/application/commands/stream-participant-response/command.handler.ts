import type { Orchestrator } from "@briom/domain/orchestrator";
import type { ParticipantRepository } from "@briom/domain/participant";
import { ParticipantId } from "@briom/domain/participant";
import {
	RoomId,
	RoomNotFoundError,
	type RoomRepository,
} from "@briom/domain/room";
import type { TurnRepository } from "@briom/domain/turn";
import { type IResult, Result } from "@briom/drimion";

import type {
	StreamParticipantResponseCommand,
	StreamParticipantResponseErrors,
	StreamParticipantResponseOutput,
} from "./command";

export class StreamParticipantResponseHandler {
	public constructor(
		private readonly orchestrator: Orchestrator,
		private readonly roomRepository: RoomRepository,
		private readonly participantRepository: ParticipantRepository,
		private readonly turnRepository: TurnRepository,
	) {}

	public async execute({
		input,
	}: StreamParticipantResponseCommand): Promise<
		IResult<StreamParticipantResponseOutput, StreamParticipantResponseErrors>
	> {
		const roomId = RoomId(input.roomId);

		const room = await this.roomRepository.findById(roomId);
		if (!room) return Result.error(new RoomNotFoundError(input.roomId));

		const [participants, turns] = await Promise.all([
			this.participantRepository.findByRoom(roomId),
			this.turnRepository.findByRoom(roomId),
		]);

		const result = await this.orchestrator.orchestrateStream({
			room,
			participants,
			turns,
			targetParticipantId: ParticipantId(input.targetParticipantId),
			intent: input.intent,
		});

		if (result.isError()) return Result.error(result.error());

		const { stream, persist } = result.value();
		return Result.success({
			stream,
			persist: async (content: string) => {
				const turnResult = await persist(content);
				if (turnResult.isError()) throw turnResult.error();
				const turn = turnResult.value();
				await this.turnRepository.save(turn);
				return turn.id.value();
			},
		});
	}
}
