import { BaseDomainEvent } from "@briom/libs/drimion";

import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

export interface DeliberationStartedPayload extends BaseRoomDomainEventPayload {
	readonly topic: string;
}

export class DeliberationStarted extends BaseDomainEvent<DeliberationStartedPayload> {
	public static readonly type = "room:deliberation-started" as const;

	public constructor(aggregateId: string, payload: DeliberationStartedPayload) {
		super(DeliberationStarted.type, aggregateId, Room.name, payload);
	}
}
