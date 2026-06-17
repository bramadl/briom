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
} from "@briom/domain/turn";
import { type InfraError, type IResult, Result, UUID } from "@briom/drimion";

import type { GenerateInput, LlmGateway } from "./ports";
import { Transcriptor } from "./transcriptor";

export interface OrchestrateInput {
	intent: Intent;
	participants: Participant[];
	room: Room;
	targetParticipantId: ParticipantId;
	turns: Turn[];
}

export interface StreamResult {
	stream: ReadableStream<string>;
	turnId: TurnId;
	turnToPersist: (content: string) => Promise<Turn>;
}

export class Orchestrator {
	private transcriptor = new Transcriptor();

	public constructor(
		private readonly llm: LlmGateway,
		private readonly sequencer: TurnSequencer,
	) {}

	private buildPromptInput({
		intent,
		participants,
		turns,
		targetParticipantId,
	}: OrchestrateInput): IResult<GenerateInput, ParticipantNotFoundError> {
		const participant = participants.find(
			(p) => p.id.value() === targetParticipantId,
		);

		if (!participant) {
			return Result.error(new ParticipantNotFoundError(targetParticipantId));
		}

		return Result.success({
			qualifiedModel: participant.qualifiedModel,
			systemPrompt: this.transcriptor.buildSystemPrompt({
				currentParticipant: participant,
				participants,
				intent,
			}),
			messages: this.transcriptor.render({ participants, turns }),
		});
	}

	public async orchestrateStream(
		input: OrchestrateInput,
	): Promise<IResult<StreamResult, ParticipantNotFoundError | InfraError>> {
		const promptResult = this.buildPromptInput(input);
		if (promptResult.isError()) return Result.error(promptResult.error());

		const streamResult = await this.llm.stream(promptResult.value());
		if (streamResult.isError()) return Result.error(streamResult.error());
		const stream = streamResult.value();

		const turnId = TurnId(UUID());
		const nextPosition = await this.sequencer.nextPositionFor(
			input.room.get("id"),
		);

		const turnToPersist = async (content: string): Promise<Turn> => {
			const turnResult = Turn.create({
				id: turnId,
				roomId: input.room.get("id"),
				sequenceNumber: nextPosition,
				author: {
					type: "participant",
					participantId: input.targetParticipantId,
				},
				intent: input.intent,
				content,
				status: "settled",
				createdAt: new Date(),
			});

			return turnResult.value();
		};

		return Result.success({ stream, turnId, turnToPersist });
	}
}
