import { DomainError } from "@briom/libs/drimion";

export class EmptyTopicError extends DomainError {
	public constructor() {
		super("Room topic cannot be empty", { context: "Room" });
	}
}
