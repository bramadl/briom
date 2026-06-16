import type { RoomNotFoundError } from "@briom/core/domain";
import type { DomainError } from "@briom/libs/drimion";

export type DeleteRoomInput = {
	roomId: string;
};

export type DeleteRoomErrors = RoomNotFoundError | DomainError;
export type DeleteRoomOutput = never;

export class DeleteRoomCommand {
	public constructor(public readonly input: DeleteRoomInput) {}
}
