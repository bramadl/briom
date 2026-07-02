import {
	CheckpointTriggerPolicy,
	CreditDeductionPolicy,
	CreditMovement,
	CreditMovementType,
	CreditUsage,
	type ICheckpointRepository,
	type ICreditMovementRepository,
	type IModeratorRepository,
	type IRoomRepository,
	type ITurnRepository,
	type Participant,
	type ParticipantId,
	type Room,
	RoomId,
	type StreamError,
	type Turn,
	TurnError,
	TurnId,
	type TurnIntent,
	TurnTokenAccumulator,
} from "@briom/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type {
	ICheckpointGenerator,
	IFxRateGateway,
	ILLMGateway,
	ILogger,
	Message,
	UsageInfo,
} from "../../../ports";
import type { StreamConsumer, TranscriptorRenderer } from "../../.services";

import type { StreamTurnCommand, StreamTurnOutput } from "./command";

export class StreamTurnHandler
	implements ICommand<StreamTurnCommand, StreamTurnOutput, ApplicationError>
{
	public constructor(
		private readonly moderatorRepository: IModeratorRepository,
		private readonly creditMovementRepository: ICreditMovementRepository,
		private readonly roomRepository: IRoomRepository,
		private readonly checkpointRepository: ICheckpointRepository,
		private readonly turnRepository: ITurnRepository,
		private readonly streamConsumer: StreamConsumer,
		private readonly transcriptorRenderer: TranscriptorRenderer,
		private readonly llmGateway: ILLMGateway,
		private readonly fxRateGateway: IFxRateGateway,
		private readonly checkpointGenerator: ICheckpointGenerator,
		private readonly eventBus: IEventBus,
		private readonly logger: ILogger,
	) {}

	public async execute({
		input,
	}: StreamTurnCommand): Promise<IResult<StreamTurnOutput, ApplicationError>> {
		const roomId = RoomId(input.roomId);
		const turnId = TurnId(input.turnId);

		const contextResult = await this.buildTurnContext(roomId, turnId);
		if (contextResult.isError()) return Result.error(contextResult.error());

		const { room, participant, turn } = contextResult.value();
		if (!turn.isPending) return Result.success(this.timestamp);

		const startResult = await this.transitionToStreaming(turn);
		if (startResult.isError()) return Result.error(startResult.error());

		const { messages, systemPrompt } = await this.buildLlmContext(
			room,
			participant,
			turn,
		);

		const streamResult = await this.llmGateway.stream({
			model: participant.qualifiedModel,
			systemPrompt,
			messages,
		});

		if (streamResult.isError()) {
			return await this.failAndRelease(
				room,
				turn,
				this.mapStreamError(streamResult.error()),
			);
		}

		const { stream, usage } = streamResult.value();
		const reader = stream.getReader();

		const streamingResult = await this.streamConsumer.consume(
			turn,
			reader,
			usage,
		);

		if (streamingResult.outcome === "aborted") {
			return await this.failAndRelease(room, turn, TurnError.aborted());
		}

		if (streamingResult.outcome === "failed") {
			this.logger.error("Stream consumption failed", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
				error: streamingResult.error,
			});

			return await this.failAndRelease(room, turn, TurnError.streamFailure());
		}

		const settleResult = await this.settleTurn(
			room,
			participant,
			turn,
			streamingResult.usage,
		);

		if (settleResult.isError()) return Result.error(settleResult.error());

		room.releaseTurnSlot();
		await this.persistAndPublish(room, turn);
		await this.generateCheckpoint(room.id);

		return Result.success(this.timestamp);
	}

	/**
	 * @description
	 * Loads the room and turn this command operates on, and resolves the
	 * participant the turn belongs to. Returns a typed not-found error for
	 * whichever entity is missing, rather than letting `undefined`
	 * propagate into later steps.
	 */
	private async buildTurnContext(
		roomId: RoomId,
		turnId: TurnId,
	): Promise<
		IResult<
			{ room: Room; participant: Participant; turn: Turn },
			ApplicationError
		>
	> {
		const [room, turn] = await Promise.all([
			this.roomRepository.findById(roomId),
			this.turnRepository.findById(turnId),
		]);

		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode(
					"ROOM_NOT_FOUND_ERROR",
				),
			);
		}

		if (!turn) {
			return Result.error(
				ApplicationError.notFound("Turn not found").withCode(
					"TURN_NOT_FOUND_ERROR",
				),
			);
		}

		const participant = room.findParticipantById(
			turn.participantId as ParticipantId,
		);

		if (!participant) {
			return Result.error(
				ApplicationError.notFound("Participant not found").withCode(
					"PARTICIPANT_NOT_FOUND_ERROR",
				),
			);
		}

		return Result.success({ room, participant, turn });
	}

	/**
	 * @description
	 * Transitions the turn into the streaming state and persists that
	 * transition immediately, before any LLM call is made — so a crash
	 * mid-stream leaves the turn correctly marked as "streaming" rather
	 * than stuck "pending" forever.
	 */
	private async transitionToStreaming(
		turn: Turn,
	): Promise<IResult<void, ApplicationError>> {
		const startResult = turn.startStream();
		if (startResult.isError()) {
			return Result.error(
				ApplicationError.conflict(startResult.error().message),
			);
		}

		await this.turnRepository.persist(turn);
		await this.eventBus.publishAll(turn.pullEvents());

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Assembles the message history and system prompt the LLM gateway
	 * needs, sourced from every turn in the room plus the latest
	 * checkpoint (if any) so context stays bounded as the room grows.
	 */
	private async buildLlmContext(
		room: Room,
		participant: Participant,
		turn: Turn,
	): Promise<{ systemPrompt: string; messages: Message[] }> {
		const allTurns = await this.turnRepository.findByRoomId(room.id);
		const latestCheckpoint = await this.checkpointRepository.findLatestByRoomId(
			room.id,
		);

		const systemPrompt = this.transcriptorRenderer.buildSystemPrompt({
			currentParticipant: participant,
			intent: turn.get("intent") as TurnIntent,
			participants: room.get("participants"),
		});

		const messages = this.transcriptorRenderer.render({
			latestCheckpoint,
			participants: room.get("participants"),
			turns: allTurns,
		});

		return { systemPrompt, messages };
	}

	/**
	 * @description
	 * Settles the turn with its final content and reported usage, then
	 * attempts to record the corresponding credit deduction. Settlement
	 * happens regardless of whether the moderator can still afford it,
	 * because the LLM cost was already incurred upstream with the
	 * provider the moment streaming completed — see recordCreditMovement
	 * for what happens when credit falls short.
	 *
	 * Once streaming completes, the LLM cost has already been incurred
	 * upstream with the provider — settling and (if needed) freezing
	 * on insufficient credit are both handled inside this, so
	 * from there it's either a clean success or an already-persisted
	 * terminal state.
	 */
	private async settleTurn(
		room: Room,
		participant: Participant,
		turn: Turn,
		usage: UsageInfo,
	): Promise<IResult<void, ApplicationError>> {
		const usageResult = CreditUsage.create({
			completionTokens: usage.completionTokens,
			costUsd: usage.costUsd,
			promptTokens: usage.promptTokens,
		});

		if (usageResult.isError()) {
			return Result.error(
				ApplicationError.unprocessableEntity(
					"Reported usage could not be recorded against this turn.",
				),
			);
		}

		const settleResult = turn.settle(turn.currentContent, usageResult.value());
		if (settleResult.isError()) {
			return Result.error(
				ApplicationError.unexpected(settleResult.error().message),
			);
		}

		const movementResult = await this.recordCreditMovement(
			room,
			participant,
			turn,
			usageResult.value(),
		);

		if (movementResult.isError()) return Result.error(movementResult.error());
		return Result.success(undefined);
	}

	/**
	 * @description
	 * Deducts credit for a settled turn's cost. If the moderator can't
	 * cover it, the room is frozen and this terminal state is persisted
	 * immediately (see freezeRoomAndPersist) — the turn keeps its settled
	 * content rather than being discarded, since the cost was already
	 * incurred with the LLM provider regardless of the moderator's balance.
	 */
	private async recordCreditMovement(
		room: Room,
		participant: Participant,
		turn: Turn,
		usage: CreditUsage,
	): Promise<IResult<void, ApplicationError>> {
		const deductionAmount = CreditDeductionPolicy.calculate(
			usage.costUsd,
			this.fxRateGateway.convert("USD", "IDR"),
		);

		const moderator = await this.moderatorRepository.findById(
			room.get("moderatorId"),
		);

		if (!moderator) {
			return Result.error(
				ApplicationError.notFound("Moderator not found").withCode(
					"MODERATOR_NOT_FOUND_ERROR",
				),
			);
		}

		if (!moderator.credit.canDeduct(deductionAmount)) {
			await this.freezeRoomAndPersist(
				room,
				turn,
				"Insufficient credit to cover this turn's cost.",
			);

			return Result.error(
				ApplicationError.paymentRequired(
					"Moderator does not have enough credit to cover this turn's cost.",
				).withCode("INSUFFICIENT_CREDIT_ERROR"),
			);
		}

		moderator.deductCredit(deductionAmount);
		await this.moderatorRepository.persist(moderator);

		const movementResult = CreditMovement.create({
			moderatorId: moderator.id,
			amount: -deductionAmount,
			type: CreditMovementType.CREDIT_DEDUCTED,
			reason: `Turn #${turn.get("sequence").get("value")} in room ${room.id.value()} (${participant.qualifiedModel})`,
		});

		if (movementResult.isSuccess()) {
			await this.creditMovementRepository.append(movementResult.value());
		}

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Freezes the room and releases its turn slot as one terminal state
	 * change, persisting and publishing immediately rather than deferring
	 * to the end of execute(). Used when a turn completed and settled
	 * successfully but the moderator can't cover its cost — unlike
	 * failAndRelease, the turn's settled content is kept, only the room
	 * transitions to frozen so no further turns can be claimed.
	 */
	private async freezeRoomAndPersist(
		room: Room,
		turn: Turn,
		reason: string,
	): Promise<void> {
		room.freezeRoom(reason);
		room.releaseTurnSlot();

		await Promise.all([
			this.roomRepository.persist(room),
			this.turnRepository.persist(turn),
		]);

		const events = [...room.pullEvents(), ...turn.pullEvents()];
		await this.eventBus.publishAll(events);
	}

	/**
	 * @description
	 * Persists the room and turn aggregates together and publishes any
	 * domain events they accumulated — the happy-path settle-and-release
	 * flow, once credit deduction has succeeded.
	 */
	private async persistAndPublish(room: Room, turn: Turn): Promise<void> {
		await Promise.all([
			this.roomRepository.persist(room),
			this.turnRepository.persist(turn),
		]);

		const events = [...room.pullEvents(), ...turn.pullEvents()];
		await this.eventBus.publishAll(events);
	}

	/**
	 * @description
	 * Re-reads the room's turns post-settlement and asks
	 * CheckpointTriggerPolicy whether accumulated token usage warrants
	 * generating a new checkpoint, enqueuing the background job if so.
	 * Only reached on the happy path — a frozen room never gets here,
	 * so no further LLM spend is triggered while credit is exhausted.
	 */
	private async generateCheckpoint(roomId: RoomId): Promise<void> {
		const refreshedTurns = await this.turnRepository.findByRoomId(roomId);
		const { reportedTokens, estimatedTokens } =
			TurnTokenAccumulator.accumulate(refreshedTurns);

		const shouldGenerate = CheckpointTriggerPolicy.shouldGenerate(
			reportedTokens,
			estimatedTokens,
		);

		if (shouldGenerate) await this.checkpointGenerator.enqueue(roomId);
	}

	/**
	 * @description
	 * Marks the turn as failed, releases the room's turn slot, and
	 * persists both — the terminal path for stream errors and aborts,
	 * where no content should be kept (unlike the credit-exhausted path,
	 * where the turn did complete and its content is preserved).
	 */
	private async failAndRelease(
		room: Room,
		turn: Turn,
		error: TurnError,
	): Promise<IResult<StreamTurnOutput, ApplicationError>> {
		const failResult = turn.fail(error);
		if (failResult.isError()) {
			return Result.error(
				ApplicationError.conflict(failResult.error().message),
			);
		}

		room.releaseTurnSlot();
		await Promise.all([
			this.roomRepository.persist(room),
			this.turnRepository.persist(turn),
		]);

		const events = [...room.pullEvents(), ...turn.pullEvents()];
		await this.eventBus.publishAll(events);

		return Result.success(this.timestamp);
	}

	/**
	 * @description
	 * Wall-clock timestamp attached to command output, used by callers
	 * for optimistic UI ordering.
	 */
	private get timestamp(): { timestamp: EpochTimeStamp } {
		return { timestamp: Math.floor(Date.now() / 1000) };
	}

	/**
	 * @description
	 * Translates gateway-level StreamError codes into the domain's
	 * TurnError variants.
	 */
	private mapStreamError(error: StreamError) {
		switch (error) {
			case "rate_limited":
				return TurnError.rateLimited();
			case "timeout":
				return TurnError.timeout();
			case "model_not_found":
				return TurnError.modelNotFound("unknown");
			case "empty_response":
				return TurnError.emptyResponse();
			default:
				return TurnError.streamFailure();
		}
	}
}
