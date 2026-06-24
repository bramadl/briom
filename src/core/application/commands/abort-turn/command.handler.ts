import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnStreamingService } from "../../services/turn-streaming.service";

import type { AbortTurnCommand } from "./command";

/**
 * @description
 * `AbortTurnHandler` — Command Handler
 *
 * Interrupts an in-flight LLM stream by signalling the `TurnStreamingService`
 * abort registry. The streaming loop detects the cancellation and transitions
 * the turn to FAILED with `StreamError.aborted()`.
 *
 * **Flow**
 * 1. Forward turnId to `TurnStreamingService.abort()`
 * 2. The service triggers the AbortController for that turn
 * 3. The streaming read loop throws an AbortError → caught → `orchestrator.fail()`
 * 4. `turn:failed` SSE event propagates to all room clients
 *
 * **Invariant Enforcement**
 * - Turn must currently be in PENDING or STREAMING status
 *   (enforced by `Turn.fail()` in the streaming loop catch block)
 * - If no abort signal is registered (turn already settled/failed), this is a no-op
 *
 * @see TurnStreamingService.abort — for signal registry
 * @see TurnLifecycleOrchestrator.fail — for FAILED state transition
 */
export class AbortTurnHandler
	implements ICommand<AbortTurnCommand, void, DomainError>
{
	public constructor(private readonly streaming: TurnStreamingService) {}

	/**
	 * @description
	 * Aborts an active stream for the given turn.
	 *
	 * @param command - Turn ID of the streaming turn to interrupt
	 * @returns Result containing void (no-op if turn is already finished)
	 */
	public async execute(
		command: AbortTurnCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId } = command.input;

		this.streaming.abort(TurnId(turnId));

		return Result.success(undefined);
	}
}
