import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to freeze a Room that isn't actively deliberating —
 * only an in-progress deliberation can be frozen.
 */
export class CannotFreezeRoomError extends DomainError {
	public constructor(reason?: string) {
		super(reason || "Only an active deliberation can be frozen", {
			context: "Room",
		});
	}
}
