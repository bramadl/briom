import type { Room, RoomNotFoundError } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

export type RenameRoomInput = {
	roomId: string;
	title: string;
};

export type RenameRoomErrors = RoomNotFoundError | DomainError;
export type RenameRoomOutput = Room;

export class RenameRoomCommand {
	public constructor(public readonly input: RenameRoomInput) {}
}
