import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Payload carried by `RoomLocked` — the lock kind (always "locked" here)
 * and the human-readable reason shown in the room banner.
 */
export interface RoomLockedPayload extends BaseRoomDomainEventPayload {
	readonly kind: "locked";
	readonly reason: string;
}

/**
 * @description
 * Emitted when a Room stops accepting new turns — an admin-only lock
 * (moderation action). FE renders reason to display in the room' banner.
 */
export class RoomLocked extends BaseDomainEvent<RoomLockedPayload> {
	public static readonly type = "room:locked" as const;

	public constructor(aggregateId: string, payload: RoomLockedPayload) {
		super(RoomLocked.type, aggregateId, "Room", payload);
	}
}
