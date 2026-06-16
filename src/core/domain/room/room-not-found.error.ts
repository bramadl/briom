import { DomainError } from "@briom/drimion";

export class RoomNotFoundError extends DomainError {
	public constructor(roomId: string) {
		super(`Room with id of "${roomId}" cannot be found`, { context: "Room" });
	}
}
