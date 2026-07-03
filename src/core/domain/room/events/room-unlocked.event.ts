import { BaseDomainEvent } from "@drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room's state is unlocked — an admin cleared a moderation lock.
 */
export interface RoomUnlockedPayload extends BaseRoomDomainEventPayload {}
export class RoomUnlocked extends BaseDomainEvent<RoomUnlockedPayload> {
	public static readonly type = "room:unlocked" as const;

	public constructor(aggregateId: string, payload: RoomUnlockedPayload) {
		super(RoomUnlocked.type, aggregateId, "Room", payload);
	}
}
