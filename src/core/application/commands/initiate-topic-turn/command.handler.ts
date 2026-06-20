import type { LlmGateway } from "@briom/core/domain/ports/llm.gateway";
import {
	ModeratorId,
	ParticipantId,
	RoomId,
	type RoomRepository,
	TurnId,
	TurnIntent,
	type TurnSequencer,
} from "@briom/domain";
import {
	DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type {
	InitiateTopicTurnCommand,
	InitiateTopicTurnOutput,
} from "./command";

/**
 * `InitiateTopicTurnHandler` — Command Handler
 *
 * Atomic orchestration of room's first deliberation:
 * 1. Generate concise topic from moderator content (LLM)
 * 2. Start deliberation with generated topic
 * 3. Create moderator turn (SETTLED, synchronous)
 * 4. Auto-trigger first participant with DIRECT intent
 *
 * **Why Atomic?**
 * FE sends one command. BE handles the complexity.
 * No FE state management for "is this the first message?"
 *
 * **Topic Generation**
 * LLM prompt: "Summarize this as a 3-5 word topic: {content}"
 * Expected output: "API Rate Limiting Strategies" (no quotes, no explanation)
 *
 * **Auto-Trigger**
 * First invited participant responds with DIRECT intent.
 * No moderator action needed — room is still "passive" until
 * first participant responds, then moderator takes over.
 */
export class InitiateTopicTurnHandler
	implements
		ICommand<InitiateTopicTurnCommand, InitiateTopicTurnOutput, DomainError>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnSequencer: TurnSequencer,
		private readonly turnOrchestrator: TurnLifecycleOrchestrator,
		private readonly eventBus: IEventBus,
		private readonly llmGateway: LlmGateway,
	) {}

	public async execute(
		command: InitiateTopicTurnCommand,
	): Promise<IResult<InitiateTopicTurnOutput, DomainError>> {
		const { roomId, moderatorId, content } = command.input;

		const room = await this.roomRepository.findById(RoomId(roomId));
		if (!room) {
			return Result.error(
				new DomainError("Room not found", { context: "InitiateTopicTurn" }),
			);
		}

		if (!room.isForming) {
			return Result.error(
				new DomainError("Room must be in FORMING status", {
					context: "InitiateTopicTurn",
				}),
			);
		}

		const topicResult = await this.generateTopic(content);
		if (topicResult.isError()) {
			return Result.error(topicResult.error());
		}

		const topic = topicResult.value();

		const startResult = room.startDeliberation(topic);
		if (startResult.isError()) return Result.error(startResult.error());

		const moderatorSequence = await this.turnSequencer.nextPositionInside(room);
		const moderatorTurnResult =
			await this.turnOrchestrator.initiateModeratorTurn({
				id: TurnId(),
				roomId: RoomId(roomId),
				sequence: moderatorSequence,
				moderatorId: ModeratorId(moderatorId),
				content,
			});

		if (moderatorTurnResult.isError()) {
			return Result.error(moderatorTurnResult.error());
		}

		const moderatorTurn = moderatorTurnResult.value();
		room.registerTurn(moderatorTurn.id);

		await this.roomRepository.persist(room);

		const roomEvents = room.pullEvents();
		const turnEvents = moderatorTurn.pullEvents();
		await this.eventBus.publishAll([...roomEvents, ...turnEvents]);

		// 7. Auto-trigger first participant with DIRECT intent
		const participants = room.get("participants");
		if (participants.length > 0) {
			const firstParticipant = participants[0];
			const participantSequence =
				await this.turnSequencer.nextPositionInside(room);

			await this.turnOrchestrator.initiateParticipantTurn({
				id: TurnId(),
				roomId: RoomId(roomId),
				sequence: participantSequence,
				participantId: ParticipantId(firstParticipant.id.value()),
				intent: TurnIntent.from("direct"),
			});
		}

		return Result.success({
			roomId: room.id.value(),
			turnId: moderatorTurn.id.value(),
			topic,
		});
	}

	/**
	 * Generates a concise topic (3-5 words) from moderator's first message.
	 * Uses LLM with aggressive constraints for speed.
	 */
	private async generateTopic(
		content: string,
	): Promise<IResult<string, DomainError>> {
		const streamResult = await this.llmGateway.stream({
			messages: [],
			qualifiedModel: "openai/gpt-4o-mini",
			systemPrompt: `Summarize the user's message as a concise topic (3-6 words, no punctuation, no explanation). Output ONLY the topic text, nothing else.`,
		});

		if (streamResult.isError()) {
			const fallback = content.split(" ").slice(0, 6).join(" ");
			return Result.success(fallback);
		}

		const stream = streamResult.value();
		const reader = stream.getReader();
		let topic = "";

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				topic += value;
			}
		} catch {
			const fallback = content.split(" ").slice(0, 5).join(" ");
			return Result.success(fallback);
		} finally {
			reader.releaseLock();
		}

		topic = topic.replace(/["']/g, "").trim();
		if (topic.length > 60) topic = topic.substring(0, 60);
		if (topic.length === 0) topic = content.split(" ").slice(0, 5).join(" ");

		return Result.success(topic);
	}
}
