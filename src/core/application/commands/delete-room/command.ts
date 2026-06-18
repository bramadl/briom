export interface DeleteRoomInput {
	roomId: string;
}

export class DeleteRoomCommand {
	constructor(public readonly input: DeleteRoomInput) {}
}
