import { DomainError } from "@briom/drimion";

export class RoomNotFoundError extends DomainError {
	constructor(roomId: string) {
		super(`Room ${roomId} not found`);
	}
}
