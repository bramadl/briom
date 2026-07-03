import {
	type IRoomRepository,
	RoomId,
	TopicGenerationPrompt,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type { ILLMGateway } from "../../../ports/gateways/llm/llm.gateway";
import { type Message, Role } from "../../../ports/gateways/llm/llm.ref";

import type { GenerateTopicCommand, GenerateTopicOutput } from "./command";

/**
 * @description
 * Application-layer command handler responsible for generating and
 * attaching a Room's topic.
 *
 * Fully decoupled from `SendModeratorTurn` — runs as background work
 * once the room's seed turn has already been persisted. Idempotent:
 * if the room already has a topic (e.g. a duplicate enqueue), the LLM
 * call is skipped entirely rather than paying for a wasted completion.
 */
export class GenerateTopicHandler
	implements
		ICommand<GenerateTopicCommand, GenerateTopicOutput, ApplicationError>
{
	public constructor(
		private readonly roomRepository: IRoomRepository,
		private readonly llmGateway: ILLMGateway,
		private readonly eventBus: IEventBus,
	) {}

	public async execute({
		input,
	}: GenerateTopicCommand): Promise<
		IResult<GenerateTopicOutput, ApplicationError>
	> {
		const roomId = RoomId(input.roomId);
		const room = await this.roomRepository.findById(roomId);

		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode(
					"ROOM_NOT_FOUND_ERROR",
				),
			);
		}

		if (room.topic !== null) {
			return Result.success({ roomId: room.id.value(), topic: room.topic });
		}

		const messages: Message[] = [
			{ role: Role.USER, content: input.seedContent },
		];

		const completionResult = await this.llmGateway.complete({
			model: TopicGenerationPrompt.summarizer,
			systemPrompt: TopicGenerationPrompt.build(),
			messages,
		});

		if (completionResult.isError()) {
			return Result.error(
				ApplicationError.badGateway("Failed to generate room topic.").withCode(
					"TOPIC_GENERATION_FAILED_ERROR",
				),
			);
		}

		const topic = completionResult.value().content.trim();
		const setTopicResult = room.setTopic(topic);
		if (setTopicResult.isError()) {
			const error = setTopicResult.error();
			return Result.error(
				ApplicationError.badRequest(error.message).causedBy(error),
			);
		}

		await this.roomRepository.persist(room);
		await this.eventBus.publishAll(room.pullEvents());

		return Result.success({ roomId: room.id.value(), topic });
	}
}
