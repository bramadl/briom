import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to create or rename a room with an empty title.
 * Room title is a required identity property.
 */
export class EmptyTitleError extends DomainError {
	public constructor() {
		super("Room title cannot be empty", { context: "Room" });
	}
}
