import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to lock a Room that isn't actively deliberating —
 * only an in-progress deliberation can be locked.
 */
export class CannotLockRoomError extends DomainError {
	public constructor(reason?: string) {
		super(reason || "Only an active deliberation can be locked", {
			context: "Room",
		});
	}
}
