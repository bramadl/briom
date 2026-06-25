import {
	type LlmGateway,
	ParticipantId,
	RoomId,
	type RoomRepository,
	type TranscriptorRenderer,
	type TurnRepository,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type {
	GenerateSynthesisCommand,
	GenerateSynthesisOutput,
} from "./command";

/**
 * @description
 * `GenerateSynthesisHandler` — Command Handler
 *
 * Thin wrapper around `GenerateSynthesisCommand` enforcing `ICommand` contract.
 * Returns the synthesis output as a Result for consistency with command handlers.
 */
export class GenerateSynthesisHandler
	implements
		ICommand<GenerateSynthesisCommand, GenerateSynthesisOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly llmGateway: LlmGateway,
		private readonly transcriptor: TranscriptorRenderer,
	) {}

	/**
	 * @description
	 * Executes the synthesis generation query.
	 *
	 * @param input - Room ID and participant ID
	 * @returns Result wrapping the synthesis output
	 */
	public async execute({
		input,
	}: GenerateSynthesisCommand): Promise<
		IResult<GenerateSynthesisOutput, DomainError>
	> {
		const { roomId, participantId } = input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", {
					context: "InitiateParticipantTurn",
				}),
			);
		}

		const participant = room.findParticipantById(ParticipantId(participantId));
		if (!participant) {
			return Result.error(
				new DomainError("Participant not found", {
					context: "InitiateParticipantTurn",
				}),
			);
		}

		const turns = await this.turnRepository.findByRoom(room);
		const participants = room.get("participants");

		const systemPrompt = this.transcriptor.buildSynthesisPrompt({
			participant,
		});

		const messages = this.transcriptor.render({ participants, turns });

		const streamResult = await this.llmGateway.stream({
			messages,
			qualifiedModel: participant.qualifiedModel,
			systemPrompt,
		});

		if (streamResult.isError()) {
			return Result.error(streamResult.error().toDomainError());
		}

		const stream = streamResult.value();
		let content = "";

		const reader = stream.getReader();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				content += value;
			}
		} finally {
			reader.releaseLock();
		}

		return Result.success({
			content,
			createdBy: participant.get("displayName"),
		});
	}
}
