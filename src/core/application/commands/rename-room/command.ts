import type { RoomNotFoundError } from "@briom/domain";
import type { DomainError } from "@briom/drimion";

export type RenameRoomInput = {
	roomId: string;
	title: string;
};

export type RenameRoomErrors = RoomNotFoundError | DomainError;
export type RenameRoomOutput = never;

export class RenameRoomCommand {
	public constructor(public readonly input: RenameRoomInput) {}
}
