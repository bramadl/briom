import type { RoomId } from "../room.id";

/**
 * @description
 * Base payload shape shared by all Room domain events.
 */
export interface BaseRoomDomainEventPayload {
	readonly occurredAt: Date;
	readonly roomId: RoomId;
}
