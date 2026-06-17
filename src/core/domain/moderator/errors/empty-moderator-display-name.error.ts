import { DomainError } from "@briom/libs/drimion";

export class EmptyModeratorDisplayNameError extends DomainError {
	public constructor() {
		super("Moderator display name cannot be empty", { context: "Moderator" });
	}
}
