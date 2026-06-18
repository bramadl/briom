import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { AbandonTurnCommand } from "./command";

export class AbandonTurnHandler
	implements ICommand<AbandonTurnCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	public async execute(
		command: AbandonTurnCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId } = command.input;

		const result = await this.orchestrator.abandon(TurnId(turnId));
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
