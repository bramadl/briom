import {
	RoomId,
	RoomNotFoundError,
	type RoomRepository,
	Turn,
	TurnId,
	type TurnRepository,
	type TurnSequencer,
} from "@briom/domain";
import { type ICommand, type IResult, Result } from "@briom/drimion";

import type {
	AddUserMessageCommand,
	AddUserMessageErrors,
	AddUserMessageOutput,
} from "./command";

export class AddUserMessageHandler
	implements
		ICommand<AddUserMessageCommand, AddUserMessageOutput, AddUserMessageErrors>
{
	public constructor(
		private readonly roomRepository: RoomRepository,
		private readonly turnRepository: TurnRepository,
		private readonly sequencer: TurnSequencer,
	) {}

	public async execute({
		input,
	}: AddUserMessageCommand): Promise<
		IResult<AddUserMessageOutput, AddUserMessageErrors>
	> {
		const roomId = RoomId(input.roomId);

		const room = await this.roomRepository.findById(roomId);
		if (!room) return Result.error(new RoomNotFoundError(input.roomId));

		const nextPosition = await this.sequencer.nextPositionFor(roomId);

		const turnResult = Turn.create({
			id: TurnId(crypto.randomUUID()),
			roomId,
			sequenceNumber: nextPosition,
			author: { type: "user" },
			content: input.content,
			createdAt: new Date(),
		});

		if (turnResult.isError()) return Result.error(turnResult.error());

		const turn = turnResult.value();
		await this.turnRepository.save(turn);

		return Result.success({ turnId: turn.id.value() });
	}
}
