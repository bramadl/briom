import { BaseDomainEvent } from "@briom/libs/drimion";

import type { TurnId } from "../../turn";
import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

export interface TurnRegisteredPayload extends BaseRoomDomainEventPayload {
	readonly turnId: TurnId;
}

export class TurnRegistered extends BaseDomainEvent<TurnRegisteredPayload> {
	public static readonly type = "room:turn-registered" as const;

	public constructor(aggregateId: string, payload: TurnRegisteredPayload) {
		super(TurnRegistered.type, aggregateId, Room.name, payload);
	}
}
