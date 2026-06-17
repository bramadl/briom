import { DomainError } from "@briom/libs/drimion";

export class EmptyRoomTitleError extends DomainError {
	public constructor() {
		super("Room title cannot be empty", { context: "Room" });
	}
}
