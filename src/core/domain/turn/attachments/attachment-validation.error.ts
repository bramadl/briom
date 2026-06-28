import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when a file attachment violates domain constraints:
 * unsupported MIME type, size limit exceeded, or invalid content/URL combination.
 */
export class AttachmentValidationError extends DomainError {
	public constructor(reason: string) {
		super(reason, { context: "TurnAttachment" });
	}
}
