import { StreamError, TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { FailTurnCommand } from "./command";

/**
 * @description
 * `FailTurnHandler` — Command Handler
 *
 * Executes the failure of a turn with classified error details.
 *
 * **Flow**
 * 1. Map input kind to domain StreamError
 * 2. Delegate to `TurnLifecycleOrchestrator.fail()`
 *
 * **Error Classification**
 * Maps command-level error kinds to domain StreamError factory methods:
 * - timeout → StreamError.timeout()
 * - rate_limited → StreamError.rateLimited()
 * - model_not_found → StreamError.modelNotFound()
 * - stream_failure → StreamError.streamFailure()
 * - aborted → StreamError.aborted()
 * - empty_response → StreamError.emptyResponse()
 *
 * @see TurnLifecycleOrchestrator.fail — for lifecycle management
 * @see StreamError — for error taxonomy
 */
export class FailTurnHandler
	implements ICommand<FailTurnCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	/**
	 * @description
	 * Fails a turn with classified error.
	 *
	 * @param command - Turn ID, error kind, and optional details
	 * @returns Result containing void, or domain error
	 */
	public async execute(
		command: FailTurnCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId, kind, message, retryAfter } = command.input;

		const error = (() => {
			switch (kind) {
				case "timeout":
					return StreamError.timeout(message);
				case "rate_limited":
					return StreamError.rateLimited(retryAfter);
				case "model_not_found":
					return StreamError.modelNotFound(message || "unknown");
				case "stream_failure":
					return StreamError.streamFailure(message);
				case "aborted":
					return StreamError.aborted(message);
				case "empty_response":
					return StreamError.emptyResponse();
				default:
					return StreamError.streamFailure("Unknown error");
			}
		})();

		const result = await this.orchestrator.fail(TurnId(turnId), error);
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
