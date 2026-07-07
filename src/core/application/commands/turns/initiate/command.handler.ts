import {
	Attachment,
	DeliberationService,
	type IModeratorRepository,
	isTextContent,
	type Moderator,
	ModeratorId,
	ModeratorPolicy,
	NotAcceptingTurnsError,
	type Participant,
	ParticipantId,
	type Room,
	RoomId,
	Turn,
	TurnId,
	type TurnIntent,
	TurnSequence,
} from "@briom/core/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@drimion";

import type { ITopicGenerator } from "../../../ports/generators/topic.generator";
import type { ITurnGenerator } from "../../../ports/generators/turn.generator";
import type { ILogger } from "../../../ports/logger/logger";
import type { IRoomUnitOfWork } from "../../../ports/unit-of-works/room.unit-of-work";

import type {
	InitiateTurnCommand,
	InitiateTurnInput,
	InitiateTurnOutput,
} from "./command";

/**
 * @description
 * Alias for readability at call-sites — `IRoomUnitOfWork` doubles as the
 * transactional handle passed into `roomUnitOfWork.execute`'s callback.
 */
type RoomTransaction = IRoomUnitOfWork;

/**
 * @description
 * Shape produced inside the transaction boundary. `shouldGenerateTopic`
 * and `participantTurnId` are internal signals consumed by the post-commit
 * generator dispatch (step 5 of `execute`) — they never leak into the
 * public `InitiateTurnOutput` contract.
 */
type WorkerResult = IResult<
	{
		participantTurnId: TurnId;
		shouldGenerateTopic: boolean;
		output: InitiateTurnOutput;
	},
	ApplicationError
>;

/**
 * @description
 * Orchestrates a complete moderator contribution within a deliberation room.
 *
 * The handler records the moderator's message, advances the room's
 * deliberation, prepares the next participant's turn, commits all domain
 * changes atomically, publishes the resulting domain events, then dispatches
 * the asynchronous work required to continue the conversation.
 *
 * Background work (participant turn execution, topic generation) is
 * scheduled only after the transaction commits, ensuring generators always
 * observe committed domain state — and their failure never rolls back
 * a successfully persisted turn.
 */
export class InitiateTurnHandler
	implements ICommand<InitiateTurnCommand, InitiateTurnOutput, ApplicationError>
{
	public constructor(
		private readonly moderatorRepository: IModeratorRepository,
		private readonly roomUnitOfWork: IRoomUnitOfWork,
		private readonly eventBus: IEventBus,
		private readonly turnGenerator: ITurnGenerator,
		private readonly topicGenerator: ITopicGenerator,
		private readonly logger: ILogger,
	) {}

	public async execute({
		input,
	}: InitiateTurnCommand): Promise<
		IResult<InitiateTurnOutput, ApplicationError>
	> {
		const roomId = RoomId(input.roomId);
		const moderatorId = ModeratorId(input.moderatorId);
		const moderatorTurnId = input.moderatorTurnId
			? TurnId(input.moderatorTurnId)
			: undefined;

		const moderator = await this.moderatorRepository.findById(moderatorId);
		if (!moderator) {
			return Result.error(
				ApplicationError.notFound("Moderator not found").withCode(
					"MODERATOR_NOT_FOUND_ERROR",
				),
			);
		}

		const result = await this.roomUnitOfWork.execute<WorkerResult>((tx) =>
			this.runTransaction(tx, { roomId, moderator, moderatorTurnId, input }),
		);

		if (result.isError()) return Result.error(result.error());
		const { output, shouldGenerateTopic, participantTurnId } = result.value();

		this.dispatchGenerators({
			roomId,
			participantTurnId,
			shouldGenerateTopic,
			seedContent: input.content,
		});

		return Result.success(output);
	}

	/**
	 * @description
	 * The transactional core — every domain mutation for this command
	 * happens here, in commit order. Each numbered step delegates to a
	 * focused private method; this method's job is purely sequencing and
	 * short-circuiting on the first error.
	 */
	private async runTransaction(
		tx: RoomTransaction,
		ctx: {
			roomId: RoomId;
			moderator: Moderator;
			moderatorTurnId?: TurnId;
			input: InitiateTurnInput;
		},
	): Promise<WorkerResult> {
		const roomResult = await this.resolveAuthorizedRoom(
			tx,
			ctx.roomId,
			ctx.moderator.id,
		);

		if (roomResult.isError()) return Result.error(roomResult.error());

		const room = roomResult.value();
		if (!room.isAcceptingTurns) {
			const error = new NotAcceptingTurnsError();
			return Result.error(
				ApplicationError.forbidden(error.message).causedBy(error),
			);
		}

		const { attachments, failedAttachments } = this.buildAttachments(
			ctx.moderator,
			room,
			ctx.input.attachments,
		);

		const isForming = room.isForming;

		const danglingFailedTurn = await this.abandonDanglingFailedTurn(tx, room);
		const moderatorTurnResult = this.createModeratorTurn(room, {
			roomId: ctx.roomId,
			moderatorId: ctx.moderator.id,
			moderatorTurnId: ctx.moderatorTurnId,
			content: ctx.input.content,
			attachments,
		});

		if (moderatorTurnResult.isError()) {
			return Result.error(moderatorTurnResult.error());
		}

		const moderatorTurn = moderatorTurnResult.value();
		if (isForming) {
			const deliberateResult = this.startDeliberation(room);
			if (deliberateResult.isError()) {
				return Result.error(deliberateResult.error());
			}
		}

		room.releaseTurnSlot({ silent: true });
		const nextResponderResult = await this.decideNextResponder(
			tx,
			room,
			ctx.roomId,
			ctx.input,
		);

		if (nextResponderResult.isError()) {
			return Result.error(nextResponderResult.error());
		}

		const { intent, nextResponderId } = nextResponderResult.value();
		const participantTurnResult = this.createParticipantTurn(room, {
			roomId: ctx.roomId,
			intent,
			nextResponderId,
			previousTurn: moderatorTurn,
		});

		if (participantTurnResult.isError()) {
			return Result.error(participantTurnResult.error());
		}

		const participantTurn = participantTurnResult.value();
		await this.persistAndPublish(
			tx,
			room,
			moderatorTurn,
			participantTurn,
			danglingFailedTurn,
		);

		const output = this.buildOutput({
			room,
			moderatorId: ctx.moderator.id,
			moderatorTurn,
			participantTurn,
			intent,
			nextResponderId,
		});

		return Result.success({
			participantTurnId: participantTurn.id,
			shouldGenerateTopic: room.topic === null,
			output: {
				...output,
				failedAttachments,
			},
		});
	}

	/**
	 * @description
	 * Loads the Room and verifies the acting Moderator owns it.
	 */
	private async resolveAuthorizedRoom(
		tx: RoomTransaction,
		roomId: RoomId,
		moderatorId: ModeratorId,
	): Promise<IResult<Room, ApplicationError>> {
		const room = await tx.roomRepository.findById(roomId);
		if (!room) {
			return Result.error(
				ApplicationError.notFound("Room not found").withCode("ROOM_NOT_FOUND"),
			);
		}

		if (!room.get("moderatorId").isEqual(moderatorId)) {
			return Result.error(ApplicationError.forbidden());
		}

		return Result.success(room);
	}

	/**
	 * @description
	 * If the room's latest turn is stuck FAILED, retires it so this new
	 * moderator turn isn't blocked behind it. Philosophy: sending a new
	 * turn is an implicit "give up" on retrying the failed one. Abandon
	 * failure is intentionally not treated as fatal — it's idempotent by
	 * nature (a turn that's already abandoned or no longer failed simply
	 * yields no-op), so only the success path is acted on.
	 */
	private async abandonDanglingFailedTurn(
		tx: RoomTransaction,
		room: Room,
	): Promise<Turn | null> {
		if (room.isFresh) return null;

		const latestTurn = await tx.turnRepository.getLatestTurnFrom(room);
		if (!latestTurn?.isFailed) return null;

		const abandoned = latestTurn.abandon();
		if (abandoned.isSuccess()) {
			await tx.turnRepository.persist(latestTurn);
		}

		return latestTurn;
	}

	/**
	 * @description
	 * Claims the turn slot and creates the settled moderator Turn,
	 * registering it into the room's history.
	 */
	private createModeratorTurn(
		room: Room,
		params: {
			roomId: RoomId;
			moderatorId: ModeratorId;
			moderatorTurnId?: TurnId;
			content: string;
			attachments: Attachment[];
		},
	): IResult<Turn, ApplicationError> {
		const slot = room.claimTurnSlot({
			passedId: params.moderatorTurnId,
			silent: true,
		});

		if (slot.isError()) {
			const error = slot.error();
			return Result.error(
				ApplicationError.conflict(error.message).causedBy(error),
			);
		}

		const turnId = params.moderatorTurnId ?? slot.value();
		const turn = Turn.initiateModeratorTurn({
			content: params.content,
			id: turnId,
			moderatorId: params.moderatorId,
			roomId: params.roomId,
			sequence: room.nextSequence,
			attachments: params.attachments,
		});

		if (turn.isError()) {
			const error = turn.error();
			return Result.error(
				ApplicationError.badRequest(error.message).causedBy(error),
			);
		}

		room.registerTurn(turn.value().id);
		return Result.success(turn.value());
	}

	/**
	 * @description
	 * Transitions the room out of FORMING. Callers are expected to only
	 * invoke this when `isForming` was true — the guard is re-verified
	 * here as a safety net, not as the primary gate.
	 */
	private startDeliberation(room: Room): IResult<void, ApplicationError> {
		const result = room.deliberate();
		if (result.isError()) {
			const error = result.error();
			return Result.error(
				ApplicationError.badRequest(error.message).causedBy(error),
			);
		}

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Resolves who speaks next and with what intent, given the room's
	 * current turn history and any explicit @mentions in this turn.
	 */
	private async decideNextResponder(
		tx: RoomTransaction,
		room: Room,
		roomId: RoomId,
		input: InitiateTurnInput,
	): Promise<
		IResult<
			{ intent: TurnIntent; nextResponderId: ParticipantId },
			ApplicationError
		>
	> {
		const turns = await tx.turnRepository.findByRoomId(roomId);
		const mentionedParticipantIds = (input.mentionedParticipantIds ?? []).map(
			(id) => ParticipantId(id),
		);

		const decision = DeliberationService.decideNextResponder(room, turns, {
			mentionedParticipantIds,
			multiDeliberation: room.isMultiDeliberation,
		});

		if (decision.isError()) {
			const error = decision.error();
			return Result.error(
				ApplicationError.unprocessableEntity(error.message).causedBy(error),
			);
		}

		return Result.success(decision.value());
	}

	/**
	 * @description
	 * Claims the turn slot (non-silent — FE needs `TurnSlotClaimed` to
	 * disable input) and creates the pending participant Turn.
	 */
	private createParticipantTurn(
		room: Room,
		params: {
			roomId: RoomId;
			intent: TurnIntent;
			nextResponderId: ParticipantId;
			previousTurn: Turn;
		},
	): IResult<Turn, ApplicationError> {
		const slot = room.claimTurnSlot();
		if (slot.isError()) {
			const error = slot.error();
			return Result.error(
				ApplicationError.conflict(error.message).causedBy(error),
			);
		}

		const turn = Turn.initiateParticipantTurn({
			id: slot.value(),
			intent: params.intent,
			participantId: params.nextResponderId,
			roomId: params.roomId,
			sequence: TurnSequence.next(params.previousTurn.get("sequence")),
			previousTurnId: params.previousTurn.id,
		});

		if (turn.isError()) {
			const error = turn.error();
			return Result.error(
				ApplicationError.badRequest(error.message).causedBy(error),
			);
		}

		room.registerTurn(turn.value().id);
		return Result.success(turn.value());
	}

	/**
	 * @description
	 * Persists every aggregate touched this transaction and publishes the
	 * combined set of domain events collected along the way.
	 */
	private async persistAndPublish(
		tx: RoomTransaction,
		room: Room,
		moderatorTurn: Turn,
		participantTurn: Turn,
		danglingFailedTurn: Turn | null,
	): Promise<void> {
		await tx.roomRepository.persist(room);
		await tx.turnRepository.persist(moderatorTurn);
		await tx.turnRepository.persist(participantTurn);

		const events = [
			...room.pullEvents(),
			...moderatorTurn.pullEvents(),
			...participantTurn.pullEvents(),
			...(danglingFailedTurn?.pullEvents() ?? []),
		];

		await this.eventBus.publishAll(events);
	}

	/**
	 * @description
	 * Shapes the transaction's outcome into the response FE renders —
	 * the moderator's settled turn plus the pending participant placeholder.
	 */
	private buildOutput(params: {
		room: Room;
		moderatorId: ModeratorId;
		moderatorTurn: Turn;
		participantTurn: Turn;
		intent: TurnIntent;
		nextResponderId: ParticipantId;
	}): Omit<InitiateTurnOutput, "failedAttachments"> {
		const participant = params.room.findParticipantById(
			params.nextResponderId,
		) as Participant;

		return {
			moderator: {
				id: params.moderatorId.value(),
				turn: { id: params.moderatorTurn.id.value() },
			},
			nextResponder: {
				participant: {
					displayName: participant.displayName,
					id: participant.id.value(),
					qualifiedModel: participant.qualifiedModel,
				},
				turn: {
					id: params.participantTurn.id.value(),
					intent: params.intent,
				},
			},
		};
	}

	/**
	 * @description
	 * Fires the implicit post-commit background work — participant turn
	 * execution (always) and topic generation (only on the room's first
	 * turn). Both are best-effort enqueues; a rejection here never fails
	 * the command, since the turn itself is already durably persisted.
	 */
	private async dispatchGenerators(params: {
		roomId: RoomId;
		participantTurnId: TurnId;
		shouldGenerateTopic: boolean;
		seedContent: string;
	}): Promise<void> {
		const [topicResult, turnResult] = await Promise.allSettled([
			params.shouldGenerateTopic
				? this.topicGenerator.enqueue(params.roomId, params.seedContent)
				: Promise.resolve(),
			this.turnGenerator.enqueue(params.roomId, params.participantTurnId),
		]);

		/** @todo - non-MVP blocker: Implement Outbox pattern. */
		if (turnResult.status === "rejected") {
			this.logger.error("A persisted participant turn will never execute", {
				roomId: params.roomId.value(),
				turnId: params.participantTurnId.value(),
				reason: turnResult.reason,
			});
		}

		if (topicResult.status === "rejected") {
			this.logger.warn("Automatic topic generation failed", {
				roomId: params.roomId.value(),
				content: `${params.seedContent.slice(0, 16)}...`,
				reason: topicResult.reason,
			});
		}
	}

	/**
	 * @description
	 * Validates each raw attachment input independently — unlike
	 * `Result.combine`, one invalid attachment no longer discards every
	 * other valid one. Failures are collected for FE to surface as
	 * per-file errors instead of being silently dropped.
	 */
	private buildAttachments(
		moderator: Moderator,
		room: Room,
		inputs: NonNullable<InitiateTurnInput["attachments"]> = [],
	): {
		attachments: Attachment[];
		failedAttachments: { name: string; reason: string }[];
	} {
		const policy = new ModeratorPolicy(moderator);
		const canAttachFile = policy.canAttachFile(room.attachmentCount);

		if (!canAttachFile) {
			return {
				attachments: [],
				failedAttachments: inputs.map((input) => ({
					name: input.name,
					reason:
						"You have reached the maximum number of attachments in this room.",
				})),
			};
		}

		const attachments: Attachment[] = [];
		const failedAttachments: { name: string; reason: string }[] = [];

		for (const { content, mimeType, name, sizeBytes, url } of inputs) {
			const result = Attachment.create({
				content,
				mediaType: isTextContent(content) ? "text" : "image",
				mimeType,
				name,
				sizeBytes,
				url,
			});

			if (result.isSuccess()) {
				attachments.push(result.value());
			} else {
				failedAttachments.push({ name, reason: result.error().message });
			}
		}

		return { attachments, failedAttachments };
	}
}
