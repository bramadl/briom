import { BaseDomainEvent } from "@briom/libs/drimion";

import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

export interface DeliberationConcludedPayload
	extends BaseRoomDomainEventPayload {}

export class DeliberationConcluded extends BaseDomainEvent<DeliberationConcludedPayload> {
	public static readonly type = "room:deliberation-concluded" as const;

	public constructor(
		aggregateId: string,
		payload: DeliberationConcludedPayload,
	) {
		super(DeliberationConcluded.type, aggregateId, Room.name, payload);
	}
}
