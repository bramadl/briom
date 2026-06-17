import { BaseDomainEvent } from "@briom/libs/drimion";

import type { ModeratorId } from "../../moderator";
import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

export interface RoomFormedPayload extends BaseRoomDomainEventPayload {
	readonly moderatorId: ModeratorId;
}

export class RoomFormed extends BaseDomainEvent<RoomFormedPayload> {
	public static readonly type = "room:formed" as const;

	public constructor(aggregateId: string, payload: RoomFormedPayload) {
		super(RoomFormed.type, aggregateId, Room.name, payload);
	}
}
