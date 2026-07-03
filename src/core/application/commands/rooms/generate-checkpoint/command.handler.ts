import {
	Checkpoint,
	type Checkpoint as CheckpointEntity,
	CheckpointFreezePolicy,
	CheckpointPrompt,
	CheckpointWordBudgetPolicy,
	CreditUsage,
	type ICheckpointRepository,
	type IModeratorRepository,
	type IRoomRepository,
	type ITurnRepository,
	type Moderator,
	type Room,
	RoomId,
	type Turn,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type { ILLMGateway } from "../../../ports/gateways/llm/llm.gateway";
import type { Message, UsageInfo } from "../../../ports/gateways/llm/llm.ref";
import type { TranscriptorRenderer } from "../../.services/transcriptor-renderer";

import type {
	GenerateCheckpointCommand,
	GenerateCheckpointOutput,
} from "./command";

/**
 * @description
 * Application-layer command handler responsible for compressing a
 * Room's deliberation history into a new Checkpoint and attaching it.
 *
 * Runs entirely as background work — no turn slot involved, no FE
 * caller waits on this. Also owns the Free-tier "checkpoint = frozen"
 * policy: once a checkpoint is successfully attached, a non-power-user
 * moderator's room is immediately frozen.
 */
export class GenerateCheckpointHandler
	implements
		ICommand<
			GenerateCheckpointCommand,
			GenerateCheckpointOutput,
			ApplicationError
		>
{
	public constructor(
		private readonly roomRepository: IRoomRepository,
		private readonly turnRepository: ITurnRepository,
		private readonly checkpointRepository: ICheckpointRepository,
		private readonly moderatorRepository: IModeratorRepository,
		private readonly transcriptorRenderer: TranscriptorRenderer,
		private readonly llmGateway: ILLMGateway,
		private readonly eventBus: IEventBus,
	) {}

	public async execute({
		input,
	}: GenerateCheckpointCommand): Promise<
		IResult<GenerateCheckpointOutput, ApplicationError>
	> {
		const roomId = RoomId(input.roomId);

		const contextResult = await this.buildContext(roomId);
		if (contextResult.isError()) return Result.error(contextResult.error());
		const { room, moderator, newTurns, latestCheckpoint } =
			contextResult.value();

		if (!room.isDeliberating || !room.topic) {
			return Result.error(
				ApplicationError.conflict(
					"Cannot generate checkpoint in a non deliberating room or a room with no topic.",
				).withCode("GENERATE_CHECKPOINT_ERROR"),
			);
		}

		if (newTurns.length === 0) {
			return Result.success({
				roomId: room.id.value(),
				checkpointId: null,
				roomFrozen: false,
			});
		}

		const wordBudget = CheckpointWordBudgetPolicy.calculate(
			room.nextCheckpointIteration,
		);

		const { systemPrompt, messages } = this.buildPrompt(
			room,
			newTurns,
			latestCheckpoint,
			wordBudget,
		);

		const completionResult = await this.llmGateway.complete({
			model: CheckpointPrompt.summarizer,
			systemPrompt,
			messages,
		});

		if (completionResult.isError()) {
			return Result.error(
				ApplicationError.badGateway("Failed to generate checkpoint.").withCode(
					"CHECKPOINT_GENERATION_FAILED_ERROR",
				),
			);
		}

		const { content, usage: usagePromise } = completionResult.value();
		const trimmedContent = content.trim();

		if (trimmedContent.length === 0) {
			return Result.error(
				ApplicationError.unprocessableEntity(
					"Model returned an empty checkpoint.",
				).withCode("EMPTY_CHECKPOINT_GENERATED_ERROR"),
			);
		}

		const checkpointId = room.initiateCheckpoint().value();
		const usage = await this.resolveUsage(usagePromise);
		const coverSequences = newTurns.at(-1)?.get("sequence").get("value") ?? 0;

		const checkpointResult = Checkpoint.create({
			id: checkpointId,
			roomId: room.id,
			content: trimmedContent,
			coverSequences,
			generatedBy: CheckpointPrompt.summarizer,
			iteration: room.nextCheckpointIteration,
			previousCheckpointId: latestCheckpoint?.id ?? null,
			usage,
			createdAt: new Date(),
		});

		if (checkpointResult.isError()) {
			const error = checkpointResult.error();
			return Result.error(
				ApplicationError.unexpected(error.message).causedBy(error),
			);
		}

		await this.checkpointRepository.persist(checkpointResult.value());
		room.attachCheckpoint(checkpointId);

		const roomFrozen = this.applyFreeTierFreeze(room, moderator);

		await this.roomRepository.persist(room);
		await this.eventBus.publishAll(room.pullEvents());

		return Result.success({
			roomId: room.id.value(),
			checkpointId: checkpointId.value(),
			roomFrozen,
		});
	}

	/**
	 * @description
	 * Loads the room, its moderator, and every settled turn that came
	 * after the room's latest checkpoint (or every settled turn, if no
	 * checkpoint exists yet) — the exact set this generation must summarize.
	 */
	private async buildContext(roomId: RoomId): Promise<
		IResult<
			{
				room: Room;
				moderator: Moderator;
				newTurns: Turn[];
				latestCheckpoint: CheckpointEntity | null;
			},
			ApplicationError
		>
	> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode(
					"ROOM_NOT_FOUND_ERROR",
				),
			);
		}

		const [moderator, allTurns, latestCheckpoint] = await Promise.all([
			this.moderatorRepository.findById(room.get("moderatorId")),
			this.turnRepository.findByRoomId(roomId),
			this.checkpointRepository.findLatestByRoomId(roomId),
		]);

		if (!moderator) {
			return Result.error(
				ApplicationError.notFound("Moderator not found").withCode(
					"MODERATOR_NOT_FOUND_ERROR",
				),
			);
		}

		const settledTurns = allTurns.filter((t) => t.isSettled);
		const newTurns = latestCheckpoint
			? settledTurns.filter(
					(t) =>
						t.get("sequence").get("value") > latestCheckpoint.coverSequences,
				)
			: settledTurns;

		return Result.success({ room, moderator, newTurns, latestCheckpoint });
	}

	/**
	 * @description
	 * Builds the checkpoint system prompt (topic + previous summary +
	 * word budget) and renders the new turns to summarize as messages —
	 * reusing `TranscriptorRenderer` so checkpoint generation and turn
	 * execution never diverge on how a Turn becomes a Message.
	 *
	 * @note
	 * During this call, the topic is sure has value.
	 * Caller returns early if the room is not deliberating or has no topic.
	 */
	private buildPrompt(
		room: Room,
		newTurns: Turn[],
		latestCheckpoint: CheckpointEntity | null,
		wordBudget: number,
	): { systemPrompt: string; messages: Message[] } {
		const systemPrompt = CheckpointPrompt.build({
			topic: room.topic as string,
			previousCheckpoint: latestCheckpoint?.content ?? null,
			wordBudget,
		});

		const messages = this.transcriptorRenderer.render({
			latestCheckpoint: null,
			participants: room.get("participants"),
			turns: newTurns,
		});

		return { systemPrompt, messages };
	}

	/**
	 * @description
	 * Resolves the checkpoint's usage metadata, tolerating providers
	 * (typically the free summarizer model) that don't report usage —
	 * same fallback-to-null behavior `ExecuteParticipantTurn` doesn't
	 * need, since checkpoint usage is informational only, never billed.
	 */
	private async resolveUsage(
		usagePromise: Promise<UsageInfo>,
	): Promise<CreditUsage | null> {
		try {
			const usage = await usagePromise;
			const result = CreditUsage.create({
				completionTokens: usage.completionTokens,
				costUsd: usage.costUsd,
				promptTokens: usage.promptTokens,
			});

			return result.isSuccess() ? result.value() : null;
		} catch {
			return null;
		}
	}

	/**
	 * @description
	 * Enforces the Free-tier policy: the first checkpoint a non-power-user
	 * moderator's room produces immediately freezes the room. Power users
	 * (positive Briom Credit balance) are exempt — checkpoints just keep
	 * their context bounded without interrupting deliberation.
	 *
	 * Freezing only applies while the room is still deliberating — if it
	 * was concluded or already locked/frozen by the time this runs, this
	 * is a no-op and `false` is returned.
	 */
	private applyFreeTierFreeze(room: Room, moderator: Moderator): boolean {
		if (!room.isDeliberating) return false;
		if (!CheckpointFreezePolicy.shouldFreeze(moderator.isPowerUser)) {
			return false;
		}

		const result = room.freezeRoom(CheckpointFreezePolicy.FREEZE_REASON);
		return result.isSuccess();
	}
}
