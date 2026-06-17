import { DomainError } from "@briom/libs/drimion";

export class EmptyTitleError extends DomainError {
	public constructor() {
		super("Room title cannot be empty", { context: "Room" });
	}
}
