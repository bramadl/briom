/**
 * @description
 * `RoomAttachmentPolicy` — Domain Policy
 *
 * Enforces file attachment constraints scoped to a single room.
 *
 * **Why per-room, not per-turn?**
 * The constraint "max 2 files per room" is a room-level invariant. Moderators
 * can attach files across different turns, but the cumulative count for the
 * room is what matters. This mirrors how `TurnLimitPolicy` works: the policy
 * object holds the rule; the `Room` aggregate enforces it on mutation.
 *
 * **Why domain, not application?**
 * These limits are product business rules — they shape the deliberation
 * experience and constrain token consumption. Infrastructure must not
 * decide them; the domain owns them.
 *
 * **Usage**
 * ```typescript
 * const policy = new RoomAttachmentPolicy();
 *
 * // In Room.attachFile():
 * if (policy.isRoomLimitReached(this.get("attachmentCount"))) {
 *   return Result.error(new MaximumAttachmentsReachedError());
 * }
 * ```
 */
export class RoomAttachmentPolicy {
	/**
	 * @description
	 * Maximum number of file attachments allowed across all turns in a room.
	 */
	public static readonly MAX_ATTACHMENTS_PER_ROOM = 2;

	public get MAX_PER_ROOM(): number {
		return RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM;
	}

	/**
	 * @description
	 * Returns true if the room has reached its attachment ceiling.
	 *
	 * @param currentCount - Number of attachments already registered in the room.
	 */
	public isRoomLimitReached(currentCount: number): boolean {
		return currentCount >= RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM;
	}

	/**
	 * @description
	 * Returns how many more attachments can be added to the room.
	 */
	public remaining(currentCount: number): number {
		return Math.max(
			0,
			RoomAttachmentPolicy.MAX_ATTACHMENTS_PER_ROOM - currentCount,
		);
	}
}
