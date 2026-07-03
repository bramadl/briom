import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to conclude a room
 * that is not actively deliberating or paused.
 */
export class CannotConcludeRoomError extends DomainError {
	public constructor(reason?: string) {
		super(reason || "Can only conclude active or paused deliberation", {
			context: "Room",
		});
	}
}
