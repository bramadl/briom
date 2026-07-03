import { DomainError } from "@drimion";

/**
 * @description
 * Thrown when attempting to attach a file to a room
 * that has already reached its attachment ceiling.
 */
export class MaximumAttachmentsReachedError extends DomainError {
	public constructor() {
		super(`Maximum attachments per room reached (${2})`, { context: "Room" });
	}
}
