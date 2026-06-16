import type { Orchestrator } from "@briom/domain/orchestrator";
import type {
	ParticipantNotFoundError,
	ParticipantRepository,
} from "@briom/domain/participant";
import { ParticipantId } from "@briom/domain/participant";
import {
	RoomId,
	RoomNotFoundError,
	type RoomRepository,
} from "@briom/domain/room";
import { Turn, type TurnRepository } from "@briom/domain/turn";
import { type InfraError, type IResult, Result } from "@briom/drimion";

import type { StreamResponseCommand, StreamResponseOutput } from "./command";

export class StreamResponseHandler {
	public constructor(
		private readonly orchestrator: Orchestrator,
		private readonly roomRepository: RoomRepository,
		private readonly participantRepository: ParticipantRepository,
		private readonly turnRepository: TurnRepository,
	) {}

	public async execute({
		input,
	}: StreamResponseCommand): Promise<
		IResult<
			StreamResponseOutput,
			RoomNotFoundError | ParticipantNotFoundError | InfraError
		>
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

		const { stream, turnId, turnToPersist } = result.value();
		const pendingTurnResult = Turn.create({
			id: turnId,
			roomId,
			sequenceNumber: 0,
			author: {
				type: "participant",
				participantId: ParticipantId(input.targetParticipantId),
			},
			intent: input.intent,
			content: "",
			status: "pending",
			createdAt: new Date(),
		});

		if (pendingTurnResult.isError()) {
			return Result.error(pendingTurnResult.error() as InfraError);
		}

		await this.turnRepository.save(pendingTurnResult.value());

		return Result.success({
			stream,
			turnId: turnId as string,
			persist: async (content: string) => {
				const turn = await turnToPersist(content);
				await this.turnRepository.save(turn);
				return turn.id.value();
			},
			markFailed: async () => {
				await this.turnRepository.updateStatus(turnId, "failed");
			},
		});
	}
}
