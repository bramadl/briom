import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when turn authorship violates domain rules.
 *
 * Examples: moderator turn with intent, retrying a moderator turn,
 * participant turn without participant ID.
 */
export class InvalidAuthorError extends DomainError {
	public constructor(
		reason: string = "Author must be either moderator or participant",
	) {
		super(reason, { context: "Turn" });
	}
}
