import {
	DomainError,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/drimion";

import type { ModeratorId } from "../moderator";
import type { ParticipantId } from "../participant";
import type { RoomId } from "../room";

import { StreamError } from "./streams";
import { Turn } from "./turn";
import type { TurnId } from "./turn.id";
import type { TurnIntent } from "./turn.intent";
import type { TurnSequence } from "./turn.sequence";

export interface TurnLifecycleEvents {
	onTurnAbandoned(turn: Turn): Promise<void>;
	onTurnFailed(turn: Turn): Promise<void>;
	onTurnInitiated(turn: Turn): Promise<void>;
	onTurnRetried(previousTurn: Turn, newTurn: Turn): Promise<void>;
	onTurnSettled(turn: Turn): Promise<void>;
	onTurnStreamStarted(turn: Turn): Promise<void>;
	onTurnTokenAccumulated(turn: Turn, token: string): Promise<void>;
}

export interface TurnLifecycleDependencies {
	cancelTimeout(turnId: TurnId): Promise<void>;
	findTurnById(id: TurnId): Promise<Turn | null>;
	forwardToken(turnId: TurnId, token: string): Promise<void>;
	notifyFailed(turnId: TurnId, error: StreamError): Promise<void>;
	notifySettled(turnId: TurnId, content: string): Promise<void>;
	notifyStreamStarted(turnId: TurnId): Promise<void>;
	persistTurn(turn: Turn): Promise<void>;
	scheduleTimeout(turnId: TurnId, timeoutMs: number): Promise<void>;
}

export class TurnLifecycleManager implements TurnLifecycleEvents {
	constructor(
		private readonly eventBus: IEventBus,
		private readonly deps: TurnLifecycleDependencies,
		private readonly timeoutMs: number,
	) {}

	async initiateModeratorTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		moderatorId: ModeratorId;
		content: string;
	}): Promise<IResult<Turn, DomainError>> {
		const result = Turn.initiateModeratorTurn(props);

		if (result.isSuccess()) {
			const turn = result.value();
			await this.deps.persistTurn(turn);
			await this.onTurnInitiated(turn);
		}

		return result;
	}

	async initiateParticipantTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		participantId: ParticipantId;
		intent: TurnIntent;
	}): Promise<IResult<Turn, DomainError>> {
		const result = Turn.initiateParticipantTurn(props);

		if (result.isSuccess()) {
			const turn = result.value();
			await this.deps.persistTurn(turn);
			await this.onTurnInitiated(turn);
		}

		return result;
	}

	async onTurnInitiated(turn: Turn): Promise<void> {
		if (turn.isPending) {
			await this.deps.scheduleTimeout(turn.id, this.timeoutMs);
		}

		const events = turn.pullEvents();
		await this.eventBus.publishAll(events);
	}

	async onTurnStreamStarted(turn: Turn): Promise<void> {
		await this.deps.cancelTimeout(turn.id);

		await this.deps.notifyStreamStarted(turn.id);

		await this.deps.persistTurn(turn);
	}

	async onTurnTokenAccumulated(turn: Turn, token: string): Promise<void> {
		await this.deps.forwardToken(turn.id, token);

		await this.deps.persistTurn(turn);
	}

	async onTurnSettled(turn: Turn): Promise<void> {
		await this.deps.cancelTimeout(turn.id);

		await this.deps.notifySettled(
			turn.id,
			turn.get("perspective").get("content"),
		);

		await this.deps.persistTurn(turn);
	}

	async onTurnFailed(turn: Turn): Promise<void> {
		await this.deps.cancelTimeout(turn.id);

		const error = turn.get("error");
		if (error) {
			await this.deps.notifyFailed(turn.id, error);
		}

		await this.deps.persistTurn(turn);
	}

	async onTurnAbandoned(turn: Turn): Promise<void> {
		await this.deps.cancelTimeout(turn.id);

		await this.deps.persistTurn(turn);
	}

	async onTurnRetried(previousTurn: Turn, newTurn: Turn): Promise<void> {
		await this.deps.cancelTimeout(previousTurn.id);

		await this.deps.persistTurn(previousTurn);
		await this.deps.persistTurn(newTurn);

		await this.deps.scheduleTimeout(newTurn.id, this.timeoutMs);
	}

	async startStream(turnId: TurnId): Promise<IResult<void, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		const result = turn.startStream();
		if (result.isSuccess()) {
			await this.deps.persistTurn(turn);
			await this.onTurnStreamStarted(turn);
		}

		return result;
	}

	async accumulate(
		turnId: TurnId,
		token: string,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		const result = turn.accumulate(token);
		if (result.isSuccess()) {
			await this.onTurnTokenAccumulated(turn, token);
		}

		return result;
	}

	async settle(
		turnId: TurnId,
		content: string,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		const result = turn.settle(content);
		if (result.isSuccess()) {
			await this.onTurnSettled(turn);
		}

		return result;
	}

	async fail(
		turnId: TurnId,
		error: StreamError,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		const result = turn.fail(error);
		if (result.isSuccess()) {
			await this.onTurnFailed(turn);
		}

		return result;
	}

	async abandon(turnId: TurnId): Promise<IResult<void, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		const result = turn.abandon();
		if (result.isSuccess()) {
			await this.onTurnAbandoned(turn);
		}

		return result;
	}

	async retry(
		turnId: TurnId,
		newId: TurnId,
	): Promise<IResult<Turn, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		const result = turn.retry(newId);
		if (result.isSuccess()) {
			const newTurn = result.value();
			await this.onTurnRetried(turn, newTurn);
		}

		return result;
	}

	async handleTimeout(turnId: TurnId): Promise<IResult<void, DomainError>> {
		const turn = await this.deps.findTurnById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", { context: "TurnLifecycleManager" }),
			);
		}

		if (!turn.isPending && !turn.isStreaming) {
			return Result.success(undefined);
		}

		const result = turn.fail(StreamError.timeout());
		if (result.isSuccess()) {
			await this.onTurnFailed(turn);
		}

		return result;
	}
}
