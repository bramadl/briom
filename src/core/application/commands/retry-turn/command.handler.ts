import { type RoomRepository, TurnId } from "@briom/domain";
import {
	type DomainError,
	type ICommand,
	type IEventBus,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { TurnLifecycleOrchestrator } from "../../services/turn-lifecycle.orchestrator";

import type { RetryTurnCommand, RetryTurnOutput } from "./command";

export class RetryTurnHandler
	implements ICommand<RetryTurnCommand, RetryTurnOutput, DomainError>
{
	constructor(
		private readonly roomRepository: RoomRepository,
		private readonly orchestrator: TurnLifecycleOrchestrator,
		private readonly eventBus: IEventBus,
	) {}

	public async execute(
		command: RetryTurnCommand,
	): Promise<IResult<RetryTurnOutput, DomainError>> {
		const { turnId } = command.input;
		const newTurnId = TurnId();

		const result = await this.orchestrator.retry(TurnId(turnId), newTurnId);
		if (result.isError()) return Result.error(result.error());

		const newTurn = result.value();
		const room = await this.roomRepository.findById(newTurn.get("roomId"));
		if (room) {
			room.registerTurn(newTurn.id);
			await this.roomRepository.persist(room);

			const roomEvents = room.pullEvents();
			const turnEvents = newTurn.pullEvents();
			await this.eventBus.publishAll([...roomEvents, ...turnEvents]);
		}

		return Result.success({ newTurnId: newTurnId.value() });
	}
}
