import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { SettleTurnCommand } from "./command";

/**
 * @description
 * `SettleTurnHandler` — Command Handler
 *
 * Executes the finalization of a streaming turn.
 *
 * **Flow**
 * 1. Delegate to `TurnLifecycleOrchestrator.settle()`
 *
 * **Invariant Enforcement**
 * - Turn must exist (enforced by orchestrator)
 * - Turn must be in `STREAMING` status (enforced by Turn.settle)
 * - Content must be non-empty (enforced by TurnPerspective.finalize)
 *
 * @see TurnLifecycleOrchestrator.settle — for lifecycle management
 */
export class SettleTurnHandler
	implements ICommand<SettleTurnCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	/**
	 * @description
	 * Settles a turn with final perspective content.
	 *
	 * @param command - Turn ID and final content
	 * @returns Result containing void, or domain error
	 */
	public async execute(
		command: SettleTurnCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId, content } = command.input;

		const result = await this.orchestrator.settle(TurnId(turnId), content);
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
