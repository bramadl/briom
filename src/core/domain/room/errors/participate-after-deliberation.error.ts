import { DomainError } from "@briom/libs/drimion";

export class ParticipateAfterDeliberation extends DomainError {
	public constructor() {
		super("Cannot invite participants after deliberation starts", {
			context: "Room",
		});
	}
}
