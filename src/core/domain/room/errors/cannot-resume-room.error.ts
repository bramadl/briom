import { DomainError } from "@briom/libs/drimion";

export class CannotResumeRoomError extends DomainError {
	public constructor() {
		super("Can only resume paused deliberation", { context: "Room" });
	}
}
