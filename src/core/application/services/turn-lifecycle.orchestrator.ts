import {
	type ModeratorId,
	type ParticipantId,
	type RoomId,
	type StreamError,
	Turn,
	type TurnId,
	type TurnIntent,
	type TurnRepository,
	type TurnSequence,
	type TurnTimeoutPolicy,
} from "@briom/core/domain";
import {
	DomainError,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { IAbortRegistry } from "../ports";
import type { IScheduler } from "../ports/scheduler";

/**
 * @description
 * `TurnLifecycleOrchestrator` — Application Service
 *
 * Coordinates the complete lifecycle of a `Turn` from initiation through settlement
 * or failure. Acts as the single point of control for all turn state transitions,
 * ensuring that domain rules are respected and side effects (events, scheduling)
 * are handled consistently.
 *
 * ** `Why` Orchestrator?**
 * Turn lifecycle spans multiple domain operations (initiate → stream → accumulate →
 * settle/fail) with infrastructure concerns in between (LLM streaming, timeout
 * scheduling). Putting this in a command handler would bloat it; putting it in
 * the domain would pollute the aggregate with infrastructure. The orchestrator
 * sits in the application layer as the conductor.
 *
 * `Responsibilities`
 * 1. `Domain operation`: delegate to `Turn` aggregate methods
 * 2. `Persistence`: save turn after each state change
 * 3. `Event publication`: pull and publish domain events
 * 4. `Timeout scheduling`: guard against hanging LLM streams
 * 5. `Error recovery`: uniform handling of stream failures
 *
 * ** `Timeout`**
 * Every participant turn gets a scheduled timeout check. If the turn is still
 * `PENDING` or `STREAMING when the threshold expires, the orchestrator fails
 * the turn automatically. Timeouts are cancelled on successful state
 * transitions (settled, failed, abandoned).
 *
 * `Human`Led Principle**
 * This orchestrator never autonomously initiates turns. It only manages
 * turns that the moderator (via command handlers) has already decided to create.
 *
 * @see Turn — for state machine and transition rules
 * @see TurnTimeoutPolicy — for timeout threshold configuration
 * @see IScheduler — for timeout scheduling contract
 */
export class TurnLifecycleOrchestrator {
	public constructor(
		private readonly eventBus: IEventBus,
		private readonly repository: TurnRepository,
		private readonly scheduler: IScheduler,
		private readonly timeout: TurnTimeoutPolicy,
		private readonly abortRegistry: IAbortRegistry,
	) {}

	/**
	 * @description
	 * `Initiates` a participant turn and schedules timeout protection.
	 *
	 * Flow:
	 * 1. Create turn via `Turn.initiateParticipantTurn()`
	 * 2. Persist to repository
	 * 3. Schedule timeout check
	 * 4. Publish domain events
	 */
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

	/**
	 * @description
	 * `Initiates` a moderator turn (immediately settled, no timeout needed).
	 *
	 * Moderator content is provided synchronously — no LLM streaming,
	 * no timeout scheduling required.
	 */
	public async initiateModeratorTurn(props: {
		id: TurnId;
		roomId: RoomId;
		sequence: TurnSequence;
		moderatorId: ModeratorId;
		content: string;
		clientTurnId?: string;
	}): Promise<IResult<Turn, DomainError>> {
		const result = Turn.initiateModeratorTurn(props);

		if (result.isSuccess()) {
			const turn = result.value();
			await this.repository.persist(turn);
			await this.publishEvents(turn);
		}

		return result;
	}

	/**
	 * @description
	 * `Transitions` a turn from `PENDING` to `STREAMING`.
	 *
	 * Cancels any pending timeout (will be rescheduled if needed) and
	 * publishes the `TurnStreamStarted` event.
	 */
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

		this.cancelTimeout(turnId);

		const result = turn.startStream();
		if (result.isError()) return result;

		await this.repository.persist(turn);
		this.scheduleTimeout(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * `Accumulates` a token from the LLM stream into the turn.
	 *
	 * Persists and publishes `TurnTokenAccumulated` event for real-time UI updates.
	 */
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

	/**
	 * @description
	 * `Finalizes` a turn after streaming completes.
	 *
	 * Cancels timeout, persists settled state, publishes TurnSettled.
	 */
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

	/**
	 * @description
	 * Marks a `Turn` as failed due to stream error.
	 *
	 * Cancels timeout, persists failure state, publishes TurnFailed.
	 */
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

	/**
	 * @description
	 * Retries a `failed` turn by resetting to `PENDING`.
	 *
	 * Cancels old timeout, schedules new one, persists and publishes events.
	 */
	public async retry(turnId: TurnId): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn) {
			return Result.error(
				new DomainError("Turn not found", {
					context: "TurnLifecycleOrchestrator",
				}),
			);
		}

		this.cancelTimeout(turnId);

		const result = turn.retry();
		if (result.isError()) return result;

		await this.repository.persist(turn);
		this.scheduleTimeout(turn);
		await this.publishEvents(turn);

		return Result.success(undefined);
	}

	/**
	 * @description
	 * Abandons a `failed` turn permanently.
	 *
	 * Cancels timeout, persists abandoned state, publishes TurnAbandoned.
	 */
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

	/**
	 * @description
	 * Handles timeout expiration for a turn.
	 *
	 * **Critical**: After failing the turn, signals the abort registry to
	 * break any hanging `for await` loop in `OpenRouterLlmGateway`.
	 */
	public async handleTimeout(
		turnId: TurnId,
	): Promise<IResult<void, DomainError>> {
		const turn = await this.repository.findById(turnId);
		if (!turn || (!turn.isPending && !turn.isStreaming)) {
			return Result.success(undefined);
		}

		const timeoutResult = this.timeout.check(turn);
		if (!timeoutResult) {
			return Result.success(undefined);
		}

		const error = timeoutResult.value();
		const result = turn.fail(error);

		if (result.isSuccess()) {
			await this.repository.persist(turn);
			await this.publishEvents(turn);

			this.abortRegistry.abort(
				turnId.value(),
				`Turn timed out after ${this.timeout.THRESHOLD.ms}ms`,
			);
		}

		return result;
	}

	/**
	 * @description
	 * Schedules a timeout check for a turn.
	 *
	 * Uses the configured TurnTimeoutPolicy threshold.
	 */
	private scheduleTimeout(turn: Turn): void {
		const threshold = this.timeout.THRESHOLD;
		this.scheduler.schedule(
			this.timeoutKey(turn.id),
			threshold.ms,
			() => void this.handleTimeout(turn.id),
		);
	}

	/**
	 * @description
	 * Cancels any scheduled timeout for a turn.
	 */
	private cancelTimeout(turnId: TurnId): void {
		this.scheduler.cancel(this.timeoutKey(turnId));
	}

	/**
	 * @description
	 * Generates the scheduler task key for a turn's timeout.
	 */
	private timeoutKey(turnId: TurnId): string {
		return `timeout:${turnId.value()}`;
	}

	/**
	 * @description
	 * Pulls and `publishes` all pending domain events from a turn.
	 */
	private async publishEvents(turn: Turn): Promise<void> {
		const events = turn.pullEvents();
		if (events.length > 0) {
			await this.eventBus.publishAll(events);
		}
	}
}
