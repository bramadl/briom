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
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type { IFxRateGateway } from "../../../ports/gateways/fx-rate/fx-rate.gateway";
import type { ILLMGateway } from "../../../ports/gateways/llm/llm.gateway";
import type { Message, UsageInfo } from "../../../ports/gateways/llm/llm.ref";
import type { ICheckpointGenerator } from "../../../ports/generators/checkpoint.generator";
import type { ILogger } from "../../../ports/logger/logger";
import type { StreamConsumer } from "../../.services/stream-consumer";
import type { TranscriptorRenderer } from "../../.services/transcriptor-renderer";

import type { StreamTurnCommand, StreamTurnOutput } from "./command";

/**
 * @description
 * Internal-only outcome of a streaming attempt. Deliberately NOT an
 * `IResult` — `IResult` can only hold success-xor-error, but this needs
 * to carry "did the slot get released" as an orthogonal fact alongside
 * whatever the command's final success/error outcome is.
 *
 * `release`:
 *  - "pending" — nobody has released the slot or persisted/published
 *                the turn's events yet; `execute`'s `finally` must do
 *                exactly that, exactly once, via `finalize()`.
 *  - "handled" — some path already released the slot AND persisted +
 *                published everything itself (currently only the
 *                insufficient-credit freeze path); `execute` must NOT
 *                touch anything again.
 */
type StreamAttemptOutcome = {
	commandResult: IResult<void, ApplicationError>;
	release: "pending" | "handled";
};

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

	/**
	 * @description
	 * Entry point. The single invariant this method exists to guarantee:
	 * **a claimed turn slot is always released, exactly once, AND the
	 * turn's domain events are persisted + published exactly once** — no
	 * matter how streaming ends (success, LLM error, abort, settlement
	 * failure, insufficient credit, or an unexpected throw).
	 *
	 * Every branch inside `runStreamAttempt` reports intent via
	 * `StreamAttemptOutcome` instead of touching the repository/event bus
	 * directly for the room+turn finalization — `finalize()` in the
	 * `finally` block is the ONLY place that happens for the "pending"
	 * case. This is what prevents both halves of the original bug: (a) a
	 * slot never released, and (b) `turn.pullEvents()` called twice,
	 * silently swallowing the second publish because the array was
	 * already drained by the first call.
	 */
	public async execute({
		input,
	}: StreamTurnCommand): Promise<IResult<StreamTurnOutput, ApplicationError>> {
		const roomId = RoomId(input.roomId);
		const turnId = TurnId(input.turnId);

		this.logger.info("StreamTurnHandler: execute start", {
			roomId: roomId.value(),
			turnId: turnId.value(),
		});

		const contextResult = await this.buildTurnContext(roomId, turnId);
		if (contextResult.isError()) {
			this.logger.error("StreamTurnHandler: turn context resolution failed", {
				roomId: roomId.value(),
				turnId: turnId.value(),
				reason: contextResult.error(),
			});

			return Result.error(contextResult.error());
		}

		const { room, participant, turn } = contextResult.value();

		if (!turn.isPending) {
			this.logger.warn(
				"StreamTurnHandler: turn is no longer pending, skipping — likely a duplicate Inngest event",
				{
					roomId: room.id.value(),
					turnId: turn.id.value(),
					currentStatus: turn.get("state").get("status"),
				},
			);

			return Result.success(this.timestamp);
		}

		let outcome: StreamAttemptOutcome | undefined;

		try {
			outcome = await this.runStreamAttempt(room, participant, turn);
		} catch (unexpectedError) {
			this.logger.error(
				"StreamTurnHandler: unhandled exception escaped runStreamAttempt",
				{
					roomId: room.id.value(),
					turnId: turn.id.value(),
					errorName:
						unexpectedError instanceof Error
							? unexpectedError.name
							: typeof unexpectedError,
					errorMessage:
						unexpectedError instanceof Error
							? unexpectedError.message
							: String(unexpectedError),
					stack:
						unexpectedError instanceof Error
							? unexpectedError.stack
							: undefined,
				},
			);

			outcome = this.markFailed(room, turn, TurnError.streamFailure());
		} finally {
			if (outcome?.release === "pending") {
				await this.finalize(room, turn);
			} else if (!outcome) {
				this.logger.error(
					"StreamTurnHandler: outcome was never assigned — releasing slot defensively to avoid a stuck room",
					{ roomId: room.id.value(), turnId: turn.id.value() },
				);

				await this.finalize(room, turn);
			}
		}

		if (outcome.commandResult.isError()) {
			this.logger.warn("StreamTurnHandler: execute finished with an error", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
				reason: outcome.commandResult.error(),
			});

			return Result.error(outcome.commandResult.error());
		}

		if (turn.isSettled) await this.generateCheckpoint(room.id);

		this.logger.info("StreamTurnHandler: execute completed successfully", {
			roomId: room.id.value(),
			turnId: turn.id.value(),
		});

		return Result.success(this.timestamp);
	}

	/**
	 * @description
	 * The actual streaming pipeline: start → call gateway → consume
	 * stream → settle. Every branch returns a `StreamAttemptOutcome`
	 * instead of releasing the slot or persisting the turn's events
	 * directly — that keeps finalization centralized in `execute`.
	 */
	private async runStreamAttempt(
		room: Room,
		participant: Participant,
		turn: Turn,
	): Promise<StreamAttemptOutcome> {
		const startResult = await this.transitionToStreaming(turn);
		if (startResult.isError()) {
			this.logger.error(
				"StreamTurnHandler: turn failed to transition to STREAMING",
				{
					roomId: room.id.value(),
					turnId: turn.id.value(),
					reason: startResult.error(),
				},
			);

			return this.markFailed(room, turn, TurnError.streamFailure());
		}

		const { messages, systemPrompt } = await this.buildLlmContext(
			room,
			participant,
			turn,
		);

		this.logger.info("StreamTurnHandler: requesting stream from LLM gateway", {
			roomId: room.id.value(),
			turnId: turn.id.value(),
			model: participant.qualifiedModel,
			messageCount: messages.length,
		});

		const streamResult = await this.llmGateway.stream({
			model: participant.qualifiedModel,
			systemPrompt,
			messages,
		});

		if (streamResult.isError()) {
			const mappedError = this.mapStreamError(streamResult.error());

			this.logger.error("StreamTurnHandler: initial stream request failed", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
				model: participant.qualifiedModel,
				rawStreamError: streamResult.error(),
				mappedTo: mappedError.get("message"),
			});

			return this.markFailed(room, turn, mappedError);
		}

		const { stream, usage } = streamResult.value();
		const reader = stream.getReader();

		this.logger.info("StreamTurnHandler: stream handshake OK, consuming", {
			roomId: room.id.value(),
			turnId: turn.id.value(),
		});

		const streamingResult = await this.streamConsumer.consume(
			turn,
			reader,
			usage,
		);

		if (streamingResult.outcome === "aborted") {
			this.logger.warn("StreamTurnHandler: stream aborted", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
			});

			return this.markFailed(room, turn, TurnError.aborted());
		}

		if (streamingResult.outcome === "failed") {
			const { message, name } = streamingResult.error;

			this.logger.error("StreamTurnHandler: stream consumption failed", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
				errorName: name,
				errorMessage: message,
			});

			return this.markFailed(room, turn, TurnError.streamFailure(message));
		}

		this.logger.info("StreamTurnHandler: stream consumed successfully", {
			roomId: room.id.value(),
			turnId: turn.id.value(),
			usage: streamingResult.usage,
		});

		return this.settleTurn(room, participant, turn, streamingResult.usage);
	}

	/**
	 * @description
	 * Loads the room and turn this command operates on, and resolves the
	 * participant the turn belongs to.
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
	 * than stuck "pending" forever. This publish is independent of
	 * `finalize()`'s later publish (different event, pulled at a
	 * different time), so no double-pull risk here.
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
	 * attempts to record the corresponding credit deduction.
	 */
	private async settleTurn(
		room: Room,
		participant: Participant,
		turn: Turn,
		usage: UsageInfo,
	): Promise<StreamAttemptOutcome> {
		const usageResult = CreditUsage.create({
			completionTokens: usage.completionTokens,
			costUsd: usage.costUsd,
			promptTokens: usage.promptTokens,
		});

		if (usageResult.isError()) {
			this.logger.error("StreamTurnHandler: reported usage failed validation", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
				rawUsage: usage,
				reason: usageResult.error(),
			});

			return this.markFailed(room, turn, TurnError.emptyResponse());
		}

		const settleResult = turn.settle(turn.currentContent, usageResult.value());
		if (settleResult.isError()) {
			this.logger.error("StreamTurnHandler: turn failed to settle", {
				roomId: room.id.value(),
				turnId: turn.id.value(),
				currentContentLength: turn.currentContent?.length ?? 0,
				reason: settleResult.error(),
			});

			return this.markFailed(room, turn, TurnError.emptyResponse());
		}

		return this.recordCreditMovement(
			room,
			participant,
			turn,
			usageResult.value(),
		);
	}

	/**
	 * @description
	 * Deducts credit for a settled turn's cost. If the moderator can't
	 * cover it, the room is frozen and that terminal state — including
	 * the slot release and event publish — is persisted immediately
	 * inside `freezeRoomAndPersist`. That's why this branch reports
	 * `release: "handled"`.
	 */
	private async recordCreditMovement(
		room: Room,
		participant: Participant,
		turn: Turn,
		usage: CreditUsage,
	): Promise<StreamAttemptOutcome> {
		const deductionAmount = CreditDeductionPolicy.calculate(
			usage.costUsd,
			await this.fxRateGateway.convert("USD", "IDR"),
		);

		const moderator = await this.moderatorRepository.findById(
			room.get("moderatorId"),
		);

		if (!moderator) {
			this.logger.error(
				"StreamTurnHandler: moderator not found while recording credit movement",
				{ roomId: room.id.value(), turnId: turn.id.value() },
			);

			return {
				commandResult: Result.error(
					ApplicationError.notFound("Moderator not found").withCode(
						"MODERATOR_NOT_FOUND_ERROR",
					),
				),
				release: "pending",
			};
		}

		if (!moderator.credit.canDeduct(deductionAmount)) {
			this.logger.warn(
				"StreamTurnHandler: insufficient credit, freezing room",
				{
					roomId: room.id.value(),
					turnId: turn.id.value(),
					moderatorId: moderator.id.value(),
					deductionAmount,
				},
			);

			await this.freezeRoomAndPersist(
				room,
				turn,
				"Insufficient credit to cover this turn's cost.",
			);

			return {
				commandResult: Result.error(
					ApplicationError.paymentRequired(
						"Moderator does not have enough credit to cover this turn's cost.",
					).withCode("INSUFFICIENT_CREDIT_ERROR"),
				),
				release: "handled",
			};
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
		} else {
			this.logger.warn(
				"StreamTurnHandler: credit movement record failed to construct — deduction still applied",
				{
					roomId: room.id.value(),
					turnId: turn.id.value(),
					reason: movementResult.error(),
				},
			);
		}

		return { commandResult: Result.success(undefined), release: "pending" };
	}

	/**
	 * @description
	 * Marks the turn as failed. Deliberately does NOT persist or publish
	 * anything — that's `finalize()`'s job, called once from `execute`'s
	 * `finally`. This is what fixes the original double-pull bug: if
	 * this method persisted+published here AND `finalize` did it again,
	 * `turn.pullEvents()` would return empty the second time, silently
	 * dropping the `TurnFailed` event FE needs to stop showing "thinking
	 * for a moment...".
	 */
	private markFailed(
		room: Room,
		turn: Turn,
		error: TurnError,
	): StreamAttemptOutcome {
		const failResult = turn.fail(error);

		if (failResult.isError()) {
			this.logger.error(
				"StreamTurnHandler: turn could not transition to FAILED state — slot will still be released",
				{
					roomId: room.id.value(),
					turnId: turn.id.value(),
					currentStatus: turn.get("state").get("status"),
					attemptedError: error,
					reason: failResult.error(),
				},
			);

			return {
				commandResult: Result.error(
					ApplicationError.conflict(failResult.error().message),
				),
				release: "pending",
			};
		}

		return {
			commandResult: Result.error(
				ApplicationError.unprocessableEntity(error.message).causedBy(error),
			),
			release: "pending",
		};
	}

	/**
	 * @description
	 * Freezes the room and releases its turn slot as one terminal state
	 * change, persisting and publishing both room and turn events
	 * immediately — this is the one path that finalizes itself instead of
	 * deferring to `finalize()`, since freezing needs to happen alongside
	 * settlement, not as a generic "turn failed" cleanup.
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

		this.logger.info("StreamTurnHandler: room frozen and slot released", {
			roomId: room.id.value(),
			turnId: turn.id.value(),
			eventCount: events.length,
		});

		await this.eventBus.publishAll(events);
	}

	/**
	 * @description
	 * The SINGLE place `room.releaseTurnSlot()` is called, and the SINGLE
	 * place `turn.pullEvents()` is called, for every "pending" outcome —
	 * happy-path settlement and every `markFailed` branch alike. Any
	 * events accumulated by `turn.fail()`/`turn.settle()` earlier in this
	 * execution are still sitting in the turn's internal event queue at
	 * this point (since `markFailed`/`settleTurn` never pull them) — this
	 * is where they're pulled and published for the first and only time.
	 */
	private async finalize(room: Room, turn: Turn): Promise<void> {
		room.releaseTurnSlot();

		await Promise.all([
			this.roomRepository.persist(room),
			this.turnRepository.persist(turn),
		]);

		const events = [...room.pullEvents(), ...turn.pullEvents()];

		this.logger.info(
			"StreamTurnHandler: finalize — slot released, publishing events",
			{
				roomId: room.id.value(),
				turnId: turn.id.value(),
				turnStatus: turn.get("state").get("status"),
				eventCount: events.length,
				eventNames: events.map((event) => event.type),
			},
		);

		if (events.length === 0) {
			this.logger.warn(
				"StreamTurnHandler: finalize produced zero events — FE will not receive any update for this turn",
				{ roomId: room.id.value(), turnId: turn.id.value() },
			);
		}

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

		this.logger.info("StreamTurnHandler: checkpoint trigger evaluated", {
			roomId: roomId.value(),
			reportedTokens,
			estimatedTokens,
			shouldGenerate,
		});

		if (shouldGenerate) await this.checkpointGenerator.enqueue(roomId);
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
