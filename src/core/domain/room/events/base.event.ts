import type { ModeratorId } from "../../moderator/moderator.id";
import type { RoomId } from "../room.id";

/**
 * @description
 * Base payload shape shared by all Room domain events.
 */
export interface BaseRoomDomainEventPayload {
	readonly moderatorId: ModeratorId;
	readonly occurredAt: Date;
	readonly roomId: RoomId;
}
