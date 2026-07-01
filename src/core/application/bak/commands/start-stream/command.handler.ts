import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { StartStreamCommand } from "./command";

/**
 * @description
 * `StartStreamHandler` — Command Handler
 *
 * Executes the transition of a turn from `PENDING` to `STREAMING`.
 *
 * **Flow**
 * 1. Delegate to `TurnLifecycleOrchestrator.startStream()`
 *
 * **Invariant Enforcement**
 * - Turn must exist (enforced by orchestrator)
 * - Turn must be in `PENDING` status (enforced by Turn.startStream)
 *
 * @see TurnLifecycleOrchestrator.startStream — for lifecycle management
 */
export class StartStreamHandler
	implements ICommand<StartStreamCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	/**
	 * @description
	 * Starts streaming for a pending turn.
	 *
	 * @param command - Turn ID to start streaming
	 * @returns Result containing void, or domain error
	 */
	public async execute(
		command: StartStreamCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId } = command.input;

		const result = await this.orchestrator.startStream(TurnId(turnId));
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
