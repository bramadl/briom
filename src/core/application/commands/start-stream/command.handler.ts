import { TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { StartStreamCommand } from "./command";

export class StartStreamHandler
	implements ICommand<StartStreamCommand, void, DomainError>
{
	constructor(private readonly orchestrator: TurnLifecycleOrchestrator) {}

	public async execute(
		command: StartStreamCommand,
	): Promise<IResult<void, DomainError>> {
		const { turnId } = command.input;

		const result = await this.orchestrator.startStream(TurnId(turnId));
		if (result.isError()) return Result.error(result.error());

		return Result.success(undefined);
	}
}
