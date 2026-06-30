import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a new Room is created and ready for participant invitations.
 */
export class RoomFormed extends BaseDomainEvent<BaseRoomDomainEventPayload> {
	public static readonly type = "room:formed" as const;

	public constructor(aggregateId: string, payload: BaseRoomDomainEventPayload) {
		super(RoomFormed.type, aggregateId, "Room", payload);
	}
}
