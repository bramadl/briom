import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when a moderator's avatar is not a valid URL.
 */
export class InvalidAvatarError extends DomainError {
	public constructor() {
		super("Avatar must be a valid HTTP or HTTPS URL", { context: "Moderator" });
	}
}
