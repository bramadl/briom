import {
	ModeratorId,
	NotAcceptingTurnsError,
	type Participant,
	ParticipantId,
	type Room,
	RoomId,
	Turn,
	type TurnId,
	type TurnIntent,
} from "@briom/domain";
import {
	ApplicationError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { ILogger, IRoomUnitOfWork, ITurnGenerator } from "../../../ports";

import type { AcceptProposalCommand, AcceptProposalOutput } from "./command";

/**
 * @description
 * Alias for readability at call-sites — `IRoomUnitOfWork` doubles as the
 * transactional handle passed into `roomUnitOfWork.execute`'s callback.
 */
type RoomTransaction = IRoomUnitOfWork;

/**
 * @description
 * Shape produced inside the transaction boundary. `turnId` is an internal
 * signal consumed by the post-commit generator dispatch — it never leaks
 * into the public `AcceptProposalOutput` contract.
 */
type WorkerResult = IResult<
	{ output: AcceptProposalOutput; turnId: TurnId },
	ApplicationError
>;

/**
 * @description
 * Orchestrates accepting a suggested turn proposal within a deliberation room.
 *
 * Unlike `SendModeratorTurn`, there is no moderator content and no
 * next-responder decision to make — the participant and intent were
 * already decided by `ProposalGenerator` and presented to the moderator
 * as a button. This handler's job is purely: validate, claim the room's
 * turn slot, create the pending participant Turn, commit, then dispatch
 * the background execution.
 *
 * Background work (participant turn execution) is scheduled only after
 * the transaction commits, ensuring the generator always observes
 * committed domain state.
 */
export class AcceptProposalHandler
	implements
		ICommand<AcceptProposalCommand, AcceptProposalOutput, ApplicationError>
{
	public constructor(
		private readonly roomUnitOfWork: IRoomUnitOfWork,
		private readonly eventBus: IEventBus,
		private readonly turnGenerator: ITurnGenerator,
		private readonly logger: ILogger,
	) {}

	public async execute({
		input,
	}: AcceptProposalCommand): Promise<
		IResult<AcceptProposalOutput, ApplicationError>
	> {
		const roomId = RoomId(input.roomId);
		const moderatorId = ModeratorId(input.moderatorId);
		const participantId = ParticipantId(input.participantId);

		const result = await this.roomUnitOfWork.execute<WorkerResult>((tx) =>
			this.runTransaction(tx, {
				roomId,
				moderatorId,
				participantId,
				intent: input.intent,
			}),
		);

		if (result.isError()) return Result.error(result.error());
		const { output, turnId } = result.value();

		await this.dispatchGenerator(roomId, turnId);
		return Result.success(output);
	}

	/**
	 * @description
	 * The transactional core — resolves and authorizes the room, validates
	 * the proposed participant, retires any dangling failed turn, claims
	 * the turn slot, and creates the pending participant Turn.
	 */
	private async runTransaction(
		tx: RoomTransaction,
		ctx: {
			roomId: RoomId;
			moderatorId: ModeratorId;
			participantId: ParticipantId;
			intent: TurnIntent;
		},
	): Promise<WorkerResult> {
		const roomResult = await this.resolveAuthorizedRoom(
			tx,
			ctx.roomId,
			ctx.moderatorId,
		);

		if (roomResult.isError()) return Result.error(roomResult.error());
		const room = roomResult.value();

		if (!room.isAcceptingTurns) {
			const error = new NotAcceptingTurnsError();
			return Result.error(
				ApplicationError.forbidden(error.message).causedBy(error),
			);
		}

		const participant = room.findParticipantById(ctx.participantId);
		if (!participant) {
			return Result.error(
				ApplicationError.notFound(
					"Participant not found in this room",
				).withCode("PARTICIPANT_NOT_FOUND_ERROR"),
			);
		}

		const previousTurn = await this.abandonDanglingFailedTurn(tx, room);

		const slot = room.claimTurnSlot();
		if (slot.isError()) {
			const error = slot.error();
			return Result.error(
				ApplicationError.conflict(error.message).causedBy(error),
			);
		}

		const turnResult = Turn.initiateParticipantTurn({
			id: slot.value(),
			intent: ctx.intent,
			participantId: ctx.participantId,
			roomId: ctx.roomId,
			sequence: room.nextSequence,
			previousTurnId: previousTurn?.id,
		});

		if (turnResult.isError()) {
			const error = turnResult.error();
			return Result.error(
				ApplicationError.badRequest(error.message).causedBy(error),
			);
		}

		const turn = turnResult.value();
		room.registerTurn(turn.id);

		await this.persistAndPublish(tx, room, turn, previousTurn);

		const output = this.buildOutput({ participant, turn, intent: ctx.intent });
		return Result.success({ output, turnId: turn.id });
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
	 * Fetches the room's latest turn and, if it's stuck FAILED, retires it
	 * so this accepted proposal isn't blocked behind a stale error — same
	 * "accepting a new turn implicitly gives up on the failed one"
	 * philosophy as `SendModeratorTurnHandler`. Returns the latest turn
	 * either way (abandoned or not) so the caller can use its ID as
	 * `previousTurnId` without a second fetch — that linkage is audit
	 * lineage only, it doesn't require the previous turn to be settled.
	 */
	private async abandonDanglingFailedTurn(
		tx: RoomTransaction,
		room: Room,
	): Promise<Turn | null> {
		if (room.isFresh) return null;

		const latestTurn = await tx.turnRepository.getLatestTurnFrom(room);
		if (!latestTurn?.isFailed) return latestTurn;

		latestTurn.abandon();
		return latestTurn;
	}

	/**
	 * @description
	 * Persists every aggregate touched this transaction and publishes the
	 * combined set of domain events collected along the way.
	 */
	private async persistAndPublish(
		tx: RoomTransaction,
		room: Room,
		turn: Turn,
		danglingFailedTurn: Turn | null,
	): Promise<void> {
		await tx.roomRepository.persist(room);
		await tx.turnRepository.persist(turn);

		if (danglingFailedTurn?.isAbandoned) {
			await tx.turnRepository.persist(danglingFailedTurn);
		}

		const events = [
			...room.pullEvents(),
			...turn.pullEvents(),
			...(danglingFailedTurn?.pullEvents() ?? []),
		];

		await this.eventBus.publishAll(events);
	}

	/**
	 * @description
	 * Shapes the transaction's outcome into the response FE renders.
	 */
	private buildOutput(params: {
		participant: Participant;
		turn: Turn;
		intent: TurnIntent;
	}): AcceptProposalOutput {
		return {
			participant: {
				id: params.participant.id.value(),
				displayName: params.participant.displayName,
				qualifiedModel: params.participant.qualifiedModel,
			},
			turn: {
				id: params.turn.id.value(),
				intent: params.intent,
			},
		};
	}

	/**
	 * @description
	 * Fires the implicit post-commit background work — participant turn
	 * execution. Best-effort: a rejection here never fails the command,
	 * since the turn itself is already durably persisted.
	 */
	private async dispatchGenerator(
		roomId: RoomId,
		turnId: TurnId,
	): Promise<void> {
		try {
			await this.turnGenerator.enqueue(roomId, turnId);
		} catch (err) {
			/** @todo - non-MVP blocker: Implement Outbox pattern. */
			this.logger.error("A persisted participant turn will never execute", {
				roomId: roomId.value(),
				turnId: turnId.value(),
				reason: err,
			});
		}
	}
}
