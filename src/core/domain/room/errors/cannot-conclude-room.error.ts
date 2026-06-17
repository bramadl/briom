import { DomainError } from "@briom/libs/drimion";

export class CannotConcludeRoomError extends DomainError {
	public constructor() {
		super("Can only conclude active or paused deliberation", {
			context: "Room",
		});
	}
}
