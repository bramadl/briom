import { ProviderError } from "@briom/core/shared";
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

import type { GenerateInput, LlmGateway } from "./ports";
import { Transcriptor } from "./transcriptor";

export interface OrchestrateInput {
	intent: Intent;
	participants: Participant[];
	room: Room;
	targetParticipantId: ParticipantId;
	turns: TurnType[];
}

export interface StreamResult {
	persist: (content: string) => Promise<IResult<TurnType, DomainError>>;
	stream: ReadableStream<string>;
}

export class Orchestrator {
	private transcriptor = new Transcriptor();

	public constructor(
		private readonly llm: LlmGateway,
		private readonly sequencer: TurnSequencer,
	) {}

	public buildPromptInput({
		intent,
		participants,
		turns,
		targetParticipantId,
	}: OrchestrateInput): IResult<GenerateInput, ParticipantNotFoundError> {
		const participant = participants.find(
			(p) => p.id.value() === targetParticipantId,
		);

		if (!participant) {
			return Result.error(new ParticipantNotFoundError(targetParticipantId), {
				identifier: targetParticipantId,
			});
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
	): Promise<IResult<StreamResult, ParticipantNotFoundError | DomainError>> {
		const promptResult = this.buildPromptInput(input);
		if (promptResult.isError()) return Result.error(promptResult.error());

		let stream: ReadableStream<string>;
		try {
			stream = await this.llm.stream(promptResult.value());
		} catch (error) {
			return Result.error(
				new ProviderError(
					error instanceof Error ? error.message : "Unknown provider error",
					{ cause: error },
				),
			);
		}

		const persist = async (
			content: string,
		): Promise<IResult<TurnType, DomainError>> => {
			const nextPosition = await this.sequencer.nextPositionFor(
				input.room.get("id"),
			);

			const turnResult = Turn.create({
				id: TurnId(crypto.randomUUID()),
				roomId: input.room.get("id"),
				sequenceNumber: nextPosition,
				author: {
					type: "participant",
					participantId: input.targetParticipantId,
				},
				intent: input.intent,
				content,
				createdAt: new Date(),
			});

			return turnResult;
		};

		return Result.success({ stream, persist });
	}
}
