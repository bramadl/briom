import { BaseDomainEvent } from "@briom/libs/drimion";

import type { ModeratorId } from "../moderator.id";
import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a new `Room` is created in `FORMING` status.
 *
 * Signals that a dedicated thinking space has been established and is ready
 * for participant invitations.
 */
export interface RoomFormedPayload extends BaseRoomDomainEventPayload {
	readonly moderatorId: ModeratorId;
}

export class RoomFormed extends BaseDomainEvent<RoomFormedPayload> {
	public static readonly type = "room:formed" as const;

	public constructor(aggregateId: string, payload: RoomFormedPayload) {
		super(RoomFormed.type, aggregateId, Room.name, payload);
	}
}
