import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { AccumulateTokenCommand } from "./command";

/**
 * @description
 * `AccumulateTokenHandler` — Command Handler
 *
 * Executes the accumulation of a single token into a streaming turn.
 *
 * **Flow**
 * 1. Delegate to `TurnLifecycleOrchestrator.accumulate()`
 *
 * **Performance**
 * This is a hot path during streaming. The handler is intentionally thin
 * to minimize overhead per token.
 *
 * @see TurnLifecycleOrchestrator.accumulate — for lifecycle management
 */
export class AccumulateTokenHandler
	implements ICommand<AccumulateTokenCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	/**
	 * @description
	 * Accumulates a token into a streaming turn.
	 *
	 * @param command - Turn ID and token text
	 * @returns Result containing void, or domain error
	 */
	public async execute(
		command: AccumulateTokenCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId, token } = command.input;

		const result = await this.orchestrator.accumulate(TurnId(turnId), token);
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
