import { BaseDomainEvent } from "@drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room's frozen is lifted — the moderator
 * self-resolved a freeze (e.g. topped up credits).
 */
export interface RoomUnfrozenPayload extends BaseRoomDomainEventPayload {}
export class RoomUnfrozen extends BaseDomainEvent<RoomUnfrozenPayload> {
	public static readonly type = "room:unfrozen" as const;

	public constructor(aggregateId: string, payload: RoomUnfrozenPayload) {
		super(RoomUnfrozen.type, aggregateId, "Room", payload);
	}
}
