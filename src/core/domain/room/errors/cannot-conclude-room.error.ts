import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to conclude a room that is not actively deliberating or paused.
 * Room must be in `DELIBERATING` or `PAUSED` status to conclude.
 */
export class CannotConcludeRoomError extends DomainError {
	public constructor(reason?: string) {
		super(reason || "Can only conclude active or paused deliberation", {
			context: "Room",
		});
	}
}
