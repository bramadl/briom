import { StreamError, TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { FailTurnCommand } from "./command";

export class FailTurnHandler
	implements ICommand<FailTurnCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

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
