import type { RoomId } from "../room.id";

export interface BaseRoomDomainEventPayload {
	readonly occurredAt: Date;
	readonly roomId: RoomId;
}
