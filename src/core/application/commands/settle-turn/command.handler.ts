import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { SettleTurnCommand } from "./command";

export class SettleTurnHandler
	implements ICommand<SettleTurnCommand, void, DomainError>
{
	constructor(private readonly orchestrator: TurnLifecycleOrchestrator) {}

	public async execute(
		command: SettleTurnCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId, content } = command.input;

		const result = await this.orchestrator.settle(TurnId(turnId), content);
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
