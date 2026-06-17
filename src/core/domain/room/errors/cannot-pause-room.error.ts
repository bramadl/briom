import { DomainError } from "@briom/libs/drimion";

export class CannotPauseRoomError extends DomainError {
	public constructor() {
		super("Can only pause active deliberation", { context: "Room" });
	}
}
