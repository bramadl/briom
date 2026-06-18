import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to pause a room that is not actively deliberating.
 * Only `DELIBERATING` rooms can be paused.
 */
export class CannotPauseRoomError extends DomainError {
	public constructor() {
		super("Can only pause active deliberation", { context: "Room" });
	}
}
