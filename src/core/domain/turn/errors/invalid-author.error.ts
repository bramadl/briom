import { DomainError } from "@briom/libs/drimion";

export class InvalidAuthorError extends DomainError {
	public constructor(
		reason: string = "Author must be either moderator or participant",
	) {
		super(reason, { context: "Turn" });
	}
}
