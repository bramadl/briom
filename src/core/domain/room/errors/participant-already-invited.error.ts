import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to invite a participant that is already
 * in the room. Each participant ID can only be present once per room.
 */
export class ParticipantAlreadyInvitedError extends DomainError {
	public constructor() {
		super("Participant already invited", {
			context: "Room",
		});
	}
}
