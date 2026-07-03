import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to invite a participant after
 * deliberation has started.
 */
export class ParticipateAfterDeliberationError extends DomainError {
	public constructor() {
		super("Cannot invite or uninvite participants after deliberation starts", {
			context: "Room",
		});
	}
}
