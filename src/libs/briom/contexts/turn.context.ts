import type { GetTurnProposalsInput } from "@briom/app/queries/get-turn-proposals/query";
import type { GetTurnProposalsHandler } from "@briom/app/queries/get-turn-proposals/query.handler";
import {
	AbandonTurnCommand,
	type AbandonTurnHandler,
	type AbandonTurnInput,
	AbortTurnCommand,
	type AbortTurnHandler,
	type AbortTurnInput,
	AccumulateTokenCommand,
	type AccumulateTokenHandler,
	type AccumulateTokenInput,
	FailTurnCommand,
	type FailTurnHandler,
	type FailTurnInput,
	type GetTurnHandler,
	type GetTurnInput,
	type GetTurnsHandler,
	type GetTurnsInput,
	InitiateModeratorTurnCommand,
	type InitiateModeratorTurnHandler,
	type InitiateModeratorTurnInput,
	InitiateParticipantTurnCommand,
	type InitiateParticipantTurnHandler,
	type InitiateParticipantTurnInput,
	InitiateTopicTurnCommand,
	type InitiateTopicTurnHandler,
	type InitiateTopicTurnInput,
	RetryTurnCommand,
	type RetryTurnHandler,
	type RetryTurnInput,
	SettleTurnCommand,
	type SettleTurnHandler,
	type SettleTurnInput,
	StartStreamCommand,
	type StartStreamHandler,
	type StartStreamInput,
} from "@briom/core/application";

/**
 * @description
 * `TurnContextDeps` — Dependency Injection Shape
 *
 * All command and query handlers required for turn lifecycle operations.
 * Injected via container to enable testability and swappable implementations.
 */
interface TurnContextDeps {
	/**
	 * @description
	 * Give up on failed turn.
	 */
	abandon: AbandonTurnHandler;
	/**
	 * @description
	 * Interrupt an in-flight LLM stream.
	 */
	abort: AbortTurnHandler;
	/**
	 * @description
	 * Stream token from LLM.
	 */
	accumulate: AccumulateTokenHandler;
	/**
	 * @description
	 * Mark turn as failed.
	 */
	fail: FailTurnHandler;
	/**
	 * @description
	 * Get single turn.
	 */
	get: GetTurnHandler;
	/**
	 * @description
	 * Get suggestions for next turns.
	 */
	getProposals: GetTurnProposalsHandler;
	/**
	 * @description
	 * Moderator sends message.
	 */
	initiateModeratorTurn: InitiateModeratorTurnHandler;
	/**
	 * @description
	 * Start AI response.
	 */
	initiateParticipantTurn: InitiateParticipantTurnHandler;
	/**
	 * @description
	 * Automatically generates topic by LLM.
	 */
	initiateTopicTurn: InitiateTopicTurnHandler;
	/**
	 * @description
	 * Get list of all turns within a room.
	 */
	list: GetTurnsHandler;
	/**
	 * @description
	 * Retry failed turn.
	 */
	retry: RetryTurnHandler;
	/**
	 * @description
	 * Complete streaming.
	 */
	settle: SettleTurnHandler;
	/**
	 * @description
	 * Begin streaming tokens.
	 */
	stream: StartStreamHandler;
}

/**
 * @description
 * `TurnContext` — Application Context
 *
 * Facade for all turn-related operations. Provides a unified interface
 * that maps to Briom's ubiquitous language while delegating to individual
 * command/query handlers.
 *
 * **Why a Context?**
 * Rather than injecting 10 handlers into a boundary layer, the boundary
 * injects one TurnContext. This reduces constructor bloat and provides
 * a discoverable API surface.
 *
 * **Operation Categories**
 * - **Initiation**: initiateModeratorTurn, initiateParticipantTurn
 * - **Streaming**: stream, accumulate, settle
 * - **Failure**: fail, retry, abandon
 * - **Query**: get, list
 *
 * **Human-Led Principle**
 * initiateParticipantTurn is the most complex operation — it triggers full
 * LLM streaming. But the moderator decides WHO speaks and with WHAT intent.
 * The context executes that decision but never autonomously chooses.
 *
 * @example
 * ```typescript
 * // Moderator contribution
 * await briom.turns.initiateModeratorTurn({ roomId, moderatorId: "user-1", content: "Thoughts?" });
 *
 * // AI participant response (triggers LLM streaming)
 * await briom.turns.initiateParticipantTurn({ roomId, participantId: "claude-1", intent: "respond" });
 *
 * // Failure recovery
 * await briom.turns.retry({ turnId: failedTurnId });
 * await briom.turns.abandon({ turnId: failedTurnId });
 * ```
 *
 * @see Briom — parent facade
 * @see Turn — domain aggregate
 */
export class TurnContext {
	public constructor(private readonly deps: TurnContextDeps) {}

	/**
	 * @description
	 * Permanently abandons a failed turn.
	 *
	 * Terminal state — no further action possible.
	 *
	 * @param input - Turn ID to abandon
	 * @returns Result containing void, or InvalidStateTransitionError
	 */
	public async abandon(input: AbandonTurnInput) {
		return this.deps.abandon.execute(new AbandonTurnCommand(input));
	}

	/*
	 * @description
	 * Aborts a currently streaming turn.
	 *
	 * Signals the in-flight LLM stream to cancel. The turn transitions to
	 * FAILED with StreamError.aborted(). Moderator may retry or abandon after.
	 *
	 * @param input - Turn ID of the streaming turn
	 * @returns Result containing void
	 */
	public async abort(input: AbortTurnInput) {
		return this.deps.abort.execute(new AbortTurnCommand(input));
	}

	/**
	 * @description
	 * Accumulates a single token from LLM stream into a turn.
	 *
	 * **Hot path**: Called once per token during streaming. Must be fast.
	 *
	 * @param input - Turn ID and token text
	 * @returns Result containing void, or InvalidStateTransitionError
	 */
	public async accumulate(input: AccumulateTokenInput) {
		return this.deps.accumulate.execute(new AccumulateTokenCommand(input));
	}

	/**
	 * @description
	 * Marks a turn as failed due to stream error.
	 *
	 * Moderator can retry or abandon after failure.
	 *
	 * @param input - Turn ID, error kind, and optional details
	 * @returns Result containing void, or domain error
	 */
	public async fail(input: FailTurnInput) {
		return this.deps.fail.execute(new FailTurnCommand(input));
	}

	/**
	 * @description
	 * Retrieves a single turn with full state.
	 *
	 * @param input - Turn ID to retrieve
	 * @returns Result containing TurnDTO
	 */
	public async get(input: GetTurnInput) {
		return this.deps.get.execute(input);
	}

	/**
	 * @description
	 * Retrieves a proposal for the next turns.
	 *
	 * @param input - Room ID to retrieve
	 * @returns Result containing TurnProposalDTO
	 */
	public async getProposals(input: GetTurnProposalsInput) {
		return this.deps.getProposals.execute(input);
	}

	/**
	 * @description
	 * Creates a moderator turn with synchronous content.
	 *
	 * Moderator turns are immediately settled (no LLM streaming).
	 *
	 * @param input - Room ID, moderator ID, and content
	 * @returns Result containing turnId, or domain error
	 */
	public async initiateModeratorTurn(input: InitiateModeratorTurnInput) {
		return this.deps.initiateModeratorTurn.execute(
			new InitiateModeratorTurnCommand(input),
		);
	}

	/**
	 * @description
	 * Creates and streams an AI participant turn.
	 *
	 * **Most complex operation**: Triggers full LLM lifecycle —
	 * pending → streaming → settled (or failed). Includes intent validation,
	 * prompt building, and token accumulation.
	 *
	 * @param input - Room ID, participant ID, and intent
	 * @returns Result containing turnId, or domain/stream error
	 */
	public async initiateParticipantTurn(input: InitiateParticipantTurnInput) {
		return this.deps.initiateParticipantTurn.execute(
			new InitiateParticipantTurnCommand(input),
		);
	}

	/**
	 * @description
	 * Generates a topic by LLM from a given content.
	 *
	 * @param input - Topic by moderator
	 */
	public async initiateTopicTurn(input: InitiateTopicTurnInput) {
		return this.deps.initiateTopicTurn.execute(
			new InitiateTopicTurnCommand(input),
		);
	}

	/**
	 * @description
	 * Lists all turns in a room, ordered by sequence.
	 *
	 * @param input - Room ID to retrieve turns for
	 * @returns Result containing array of TurnDTOs
	 */
	public async list(input: GetTurnsInput) {
		return this.deps.list.execute(input);
	}

	/**
	 * @description
	 * Retries a failed turn with fresh LLM streaming.
	 *
	 * Preserves original turn ID, sequence, author, and intent.
	 * Regenerates perspective from scratch.
	 *
	 * @param input - Turn ID to retry
	 * @returns Result containing newTurnId, or domain/stream error
	 */
	public async retry(input: RetryTurnInput) {
		return this.deps.retry.execute(new RetryTurnCommand(input));
	}

	/**
	 * @description
	 * Finalizes a turn after streaming completes.
	 *
	 * Transitions STREAMING → SETTLED. Perspective becomes shared context.
	 *
	 * @param input - Turn ID and final content
	 * @returns Result containing void, or domain error
	 */
	public async settle(input: SettleTurnInput) {
		return this.deps.settle.execute(new SettleTurnCommand(input));
	}

	/**
	 * @description
	 * Manually starts streaming for a pending turn.
	 *
	 * Normally automatic (called by initiateParticipantTurn). Exposed for
	 * retry scenarios and testing.
	 *
	 * @param input - Turn ID to start streaming
	 * @returns Result containing void, or InvalidStateTransitionError
	 */
	public async stream(input: StartStreamInput) {
		return this.deps.stream.execute(new StartStreamCommand(input));
	}
}
