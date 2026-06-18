import {
	type ModeratorId,
	type ParticipantId,
	type RoomId,
	StreamError,
	Turn,
	type TurnId,
	type TurnIntent,
	type TurnRepository,
	type TurnSequence,
} from "@briom/core/domain";
import {
	DomainError,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { IScheduler } from "./ports/scheduler";

export class TurnLifecycleOrchestrator {
	public constructor(
		private readonly eventBus: IEventBus,
		private readonly repository: TurnRepository,
		private readonly scheduler: IScheduler,
		private readonly timeoutMs: number,
	) {}

	public async initiateParticipantTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		participantId: ParticipantId;
		intent: TurnIntent;
	}): Promise<IResult<Turn, DomainError>> {
		const result = Turn.initiateParticipantTurn(props);

		if (result.isSuccess()) {
			const turn = result.value();
			await this.repository.persist(turn);

			this.scheduleTimeout(turn);
			await this.publishEvents(turn);
		}

		return result;
	}

	public async initiateModeratorTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		moderatorId: ModeratorId;
		content: string;
	}): Promise<IResult<Turn, DomainError>> {
		const result = Turn.initiateModeratorTurn(props);

		if (result.isSuccess()) {
			const turn = result.value();
			await this.repository.persist(turn);
			await this.publishEvents(turn);
		}

		return result;
	}

	public async startStream(
		turnId: TurnId,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		const result = turn.startStream();
		if (result.isError()) return result;

		this.cancelTimeout(turnId);
		await this.repository.persist(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	public async accumulate(
		turnId: TurnId,
		token: string,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		const result = turn.accumulate(token);
		if (result.isError()) return result;

		await this.repository.persist(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	public async settle(
		turnId: TurnId,
		content: string,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		const result = turn.settle(content);
		if (result.isError()) return result;

		this.cancelTimeout(turnId);
		await this.repository.persist(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	public async fail(
		turnId: TurnId,
		error: StreamError,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		const result = turn.fail(error);
		if (result.isError()) return result;

		this.cancelTimeout(turnId);
		await this.repository.persist(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	public async abandon(turnId: TurnId): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		const result = turn.abandon();
		if (result.isError()) return result;

		this.cancelTimeout(turnId);
		await this.repository.persist(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	public async retry(
		turnId: TurnId,
		newId: TurnId,
	): Promise<IResult<Turn, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		this.cancelTimeout(turnId);

		const result = turn.retry(newId);
		if (result.isError()) return result;

		const newTurn = result.value();
		await this.repository.persist(turn);
		await this.repository.persist(newTurn);

		this.scheduleTimeout(newTurn);
		await this.publishEvents(turn);
		await this.publishEvents(newTurn);

		return Result.success(newTurn);
	}

	public async handleTimeout(
		turnId: TurnId,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn || (!turn.isPending && !turn.isStreaming)) {
			return Result.success(undefined);
		}

		const result = turn.fail(StreamError.timeout());
		if (result.isSuccess()) {
			await this.repository.persist(turn);
			await this.publishEvents(turn);
		}

		return result;
	}

	private scheduleTimeout(turn: Turn): void {
		this.scheduler.schedule(
			this.timeoutKey(turn.id),
			this.timeoutMs,
			() => void this.handleTimeout(turn.id),
		);
	}

	private cancelTimeout(turnId: TurnId): void {
		this.scheduler.cancel(this.timeoutKey(turnId));
	}

	private timeoutKey(turnId: TurnId): string {
		return `timeout:${turnId.value()}`;
	}

	private async publishEvents(turn: Turn): Promise<void> {
		const events = turn.pullEvents();
		if (events.length > 0) {
			await this.eventBus.publishAll(events);
		}
	}
}
