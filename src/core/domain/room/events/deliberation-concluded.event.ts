import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room is concluded and becomes read-only.
 */
export class DeliberationConcluded extends BaseDomainEvent<BaseRoomDomainEventPayload> {
	public static readonly type = "room:deliberation-concluded" as const;

	public constructor(aggregateId: string, payload: BaseRoomDomainEventPayload) {
		super(DeliberationConcluded.type, aggregateId, "Room", payload);
	}
}
