import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface RoomFrozenPayload extends BaseRoomDomainEventPayload {
	readonly kind: "frozen";
	readonly reason: string;
}

/**
 * @description
 * Emitted when a Room stops accepting new turns — a self-resolvable
 * freeze. FE renders reason to display in the room' banner.
 */
export class RoomFrozen extends BaseDomainEvent<RoomFrozenPayload> {
	public static readonly type = "room:frozen" as const;

	public constructor(aggregateId: string, payload: RoomFrozenPayload) {
		super(RoomFrozen.type, aggregateId, "Room", payload);
	}
}
