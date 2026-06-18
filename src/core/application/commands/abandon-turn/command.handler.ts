import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { AbandonTurnCommand } from "./command";

/**
 * @description
 * `AbandonTurnHandler` — Command Handler
 *
 * Executes the permanent abandonment of a failed turn.
 *
 * **Flow**
 * 1. Delegate to `TurnLifecycleOrchestrator.abandon()`
 *
 * **Invariant Enforcement**
 * - Turn must exist (enforced by orchestrator)
 * - Turn must be in `FAILED` status (enforced by Turn.abandon)
 *
 * @see TurnLifecycleOrchestrator.abandon — for lifecycle management
 */
export class AbandonTurnHandler
	implements ICommand<AbandonTurnCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	/**
	 * @description
	 * Abandons a failed turn permanently.
	 *
	 * @param command - Turn ID to abandon
	 * @returns Result containing void, or domain error
	 */
	public async execute(
		command: AbandonTurnCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId } = command.input;

		const result = await this.orchestrator.abandon(TurnId(turnId));
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
