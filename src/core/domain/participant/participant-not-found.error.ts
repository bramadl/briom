import { DomainError } from "@briom/drimion";

export class ParticipantNotFoundError extends DomainError {
	constructor(participantId: string) {
		super(`Participant ${participantId} not found in room`);
	}
}
