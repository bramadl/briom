import { DomainError } from "@briom/drimion";

export class ParticipantNotFoundError extends DomainError {
	public constructor(participantId: string) {
		super(
			`Participant with id of "${participantId}" cannot be found in the room`,
			{ context: "Participant" },
		);
	}
}
