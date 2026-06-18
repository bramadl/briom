import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to invite a participant after deliberation has started.
 *
 * **Invariant**: Participant roster is frozen once deliberation begins to preserve
 * shared context integrity.
 */
export class ParticipateAfterDeliberationError extends DomainError {
	public constructor() {
		super("Cannot invite participants after deliberation starts", {
			context: "Room",
		});
	}
}
