import { DomainError } from "@briom/libs/drimion";

/**
 * @description
 * Thrown when attempting to attach a file to a room that has already
 * reached its attachment ceiling (`RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM`).
 *
 * The application layer should check `room.canAttachMore` before uploading —
 * this error is the domain's last line of defense if that check is bypassed.
 */
export class MaximumAttachmentsReachedError extends DomainError {
	public constructor() {
		super(`Maximum attachments per room reached (${2})`, { context: "Room" });
	}
}
