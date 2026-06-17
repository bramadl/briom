import { BaseDomainEvent } from "@briom/libs/drimion";

import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

export interface DeliberationResumedPayload
	extends BaseRoomDomainEventPayload {}

export class DeliberationResumed extends BaseDomainEvent<DeliberationResumedPayload> {
	public static readonly type = "room:deliberation-resumed" as const;

	public constructor(aggregateId: string, payload: DeliberationResumedPayload) {
		super(DeliberationResumed.type, aggregateId, Room.name, payload);
	}
}
