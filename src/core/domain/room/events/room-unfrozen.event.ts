import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room's frozen is lifted — the moderator
 * self-resolved a freeze (e.g. topped up credits).
 */
export class RoomUnfrozen extends BaseDomainEvent<BaseRoomDomainEventPayload> {
	public static readonly type = "room:unfrozen" as const;

	public constructor(aggregateId: string, payload: BaseRoomDomainEventPayload) {
		super(RoomUnfrozen.type, aggregateId, "Room", payload);
	}
}
