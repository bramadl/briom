import {
	type Participant,
	type ParticipantId,
	ParticipantNotFoundError,
} from "@briom/domain/participant";
import type { Room } from "@briom/domain/room";
import {
	type Intent,
	Turn,
	TurnId,
	type TurnSequencer,
	type Turn as TurnType,
} from "@briom/domain/turn";
import { type DomainError, type IResult, Result } from "@briom/drimion";

import type { LlmGateway } from "./ports";
import { Transcriptor } from "./transcriptor";

export interface OrchestrateInput {
	intent: Intent;
	participants: Participant[];
	room: Room;
	targetParticipantId: ParticipantId;
	turns: TurnType[];
}

export class Orchestrator {
	private transcriptor = new Transcriptor();

	public constructor(
		private readonly llm: LlmGateway,
		private readonly sequencer: TurnSequencer,
	) {}

	public async orchestrate({
		intent,
		participants,
		room,
		targetParticipantId,
		turns,
	}: OrchestrateInput): Promise<
		IResult<Turn, ParticipantNotFoundError | DomainError>
	> {
		const participant = participants.find(
			(p) => p.id.value() === targetParticipantId,
		);

		if (!participant) {
			return Result.error(new ParticipantNotFoundError(targetParticipantId), {
				identifier: targetParticipantId,
			});
		}

		const generation = await this.llm.generate({
			qualifiedModel: participant.qualifiedModel,
			systemPrompt: this.transcriptor.buildSystemPrompt({
				currentParticipant: participant,
				participants,
				intent,
			}),
			messages: this.transcriptor.render({ participants, turns }),
		});

		const nextPosition = await this.sequencer.nextPositionFor(room.get("id"));

		const turnResult = Turn.create({
			id: TurnId(crypto.randomUUID()),
			roomId: room.get("id"),
			sequenceNumber: nextPosition,
			author: {
				type: "participant",
				participantId: targetParticipantId,
			},
			intent,
			content: generation.content,
			createdAt: new Date(),
		});

		if (turnResult.isError()) return Result.error(turnResult.error());
		return Result.success(turnResult.value());
	}
}
