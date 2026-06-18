import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to resume a room that is not paused.
 * Only `PAUSED` rooms can be resumed.
 */
export class CannotResumeRoomError extends DomainError {
	public constructor() {
		super("Can only resume paused deliberation", { context: "Room" });
	}
}
