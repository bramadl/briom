import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when a participant cannot be found called.
 */
export class ParticipantNotFoundError extends DomainError {
	public constructor() {
		super("Participant cannot be found", { context: "RoomDeliberation" });
	}
}
