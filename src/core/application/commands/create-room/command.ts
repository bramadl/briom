export type CreateRoomInput = { title: string };

export type CreateRoomOutput = { roomId: string };

export class CreateRoomCommand {
	constructor(public readonly input: CreateRoomInput) {}
}
