import { DomainError } from "@briom/libs/drimion";

export class ParticipantAlreadyInvitedError extends DomainError {
	public constructor() {
		super("Participant already invited", {
			context: "Room",
		});
	}
}
