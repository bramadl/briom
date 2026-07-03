import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to invite a participant when the room
 * already reached its maximum count.
 */
export class MaximumParticipantReachedError extends DomainError {
	public constructor() {
		super("Maximum participant reached", {
			context: "Room",
		});
	}
}
