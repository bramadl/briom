import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when a participant pool cannot be determined
 */
export class NoParticipantsAvailableError extends DomainError {
	public constructor() {
		super("Participant cannot be found", { context: "RoomDeliberation" });
	}
}
