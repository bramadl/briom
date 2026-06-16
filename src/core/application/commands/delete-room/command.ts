export type DeleteRoomInput = { roomId: string };

export type DeleteRoomOutput = never;

export class DeleteRoomCommand {
	public constructor(public readonly input: DeleteRoomInput) {}
}
