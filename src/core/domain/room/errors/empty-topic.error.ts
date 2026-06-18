import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to start deliberation with an empty topic.
 * The topic defines what is being explored; it cannot be blank.
 */
export class EmptyTopicError extends DomainError {
	public constructor() {
		super("Room topic cannot be empty", { context: "Room" });
	}
}
