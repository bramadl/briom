import type { Moderator } from "./moderator";

/**
 * @description
 * Business rules governing what a Moderator is allowed to do
 *
 * Evaluated against the Moderator's current credit balance:
 * - Zero balance → BASIC
 * - Positive balance → LIMITLESS
 *
 * Instantiate directly in the application layer —
 * this is pure domain logic, not an injectable service.
 *
 * @example
 * ```typescript
 * const policy = new ModeratorPolicy(moderator);
 * if (!policy.canFormRoom(activeRoomCount)) {
 *   return Result.error(new RoomLimitReachedError());
 * }
 * ```
 */
export class ModeratorPolicy {
	private static readonly BASIC = {
		rooms: 5,
		participantsPerRoom: 4,
		attachmentsPerRoom: 1,
	} as const;

	private static readonly LIMITLESS = {
		rooms: Infinity,
		participantsPerRoom: Infinity,
		attachmentsPerRoom: Infinity,
	} as const;

	private readonly tier: "BASIC" | "LIMITLESS";

	private readonly limits:
		| typeof ModeratorPolicy.BASIC
		| typeof ModeratorPolicy.LIMITLESS;

	public constructor(moderator: Moderator) {
		if (moderator.credit.balance > 0) {
			this.tier = "LIMITLESS";
			this.limits = ModeratorPolicy.LIMITLESS;
		} else {
			this.tier = "BASIC";
			this.limits = ModeratorPolicy.BASIC;
		}
	}

	/**
	 * @description
	 * Maximum room the Moderator can form and deliberate.
	 */
	public get maximumRooms() {
		return this.tier === "LIMITLESS"
			? ModeratorPolicy.LIMITLESS.rooms
			: ModeratorPolicy.BASIC.rooms;
	}

	/**
	 * @description
	 * Maximum participants the Moderator can invite to a room.
	 */
	public get maximumParticipantsPerRoom() {
		return this.tier === "LIMITLESS"
			? ModeratorPolicy.LIMITLESS.participantsPerRoom
			: ModeratorPolicy.BASIC.participantsPerRoom;
	}

	/**
	 * @description
	 * Maximum attachments the Moderator can send within a turn in a room.
	 */
	public get maximumAttachments() {
		return this.tier === "LIMITLESS"
			? ModeratorPolicy.LIMITLESS.attachmentsPerRoom
			: ModeratorPolicy.BASIC.attachmentsPerRoom;
	}

	/**
	 * @description
	 * Returns true if the Moderator can open another room.
	 */
	public canFormRoom(activeRoomCount: number): boolean {
		return activeRoomCount < this.limits.rooms;
	}

	/**
	 * @description
	 * Returns true if another participant can be invited into the room.
	 */
	public canInviteParticipant(currentParticipantCount: number): boolean {
		return currentParticipantCount < this.limits.participantsPerRoom;
	}

	/**
	 * @description
	 * Returns true if another file can be attached to the room.
	 */
	public canAttachFile(currentAttachmentCount: number): boolean {
		return currentAttachmentCount < this.limits.attachmentsPerRoom;
	}
}
