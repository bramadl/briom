export type RenameRoomInput = {
	roomId: string;
	title: string;
};

export type RenameRoomOutput = never;

export class RenameRoomCommand {
	public constructor(public readonly input: RenameRoomInput) {}
}
