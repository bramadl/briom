import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { AccumulateTokenCommand } from "./command";

export class AccumulateTokenHandler
	implements ICommand<AccumulateTokenCommand, void, DomainError>
{
	public constructor(
		private readonly orchestrator: TurnLifecycleOrchestrator,
	) {}

	public async execute(
		command: AccumulateTokenCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId, token } = command.input;

		const result = await this.orchestrator.accumulate(TurnId(turnId), token);
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
