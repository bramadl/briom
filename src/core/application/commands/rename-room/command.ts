export interface RenameRoomInput {
	newTitle: string;
	roomId: string;
}

export class RenameRoomCommand {
	constructor(public readonly input: RenameRoomInput) {}
}
