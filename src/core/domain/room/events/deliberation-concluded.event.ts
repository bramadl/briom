import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room is concluded and becomes read-only.
 */
export interface DeliberationConcludedPayload
	extends BaseRoomDomainEventPayload {}

export class DeliberationConcluded extends BaseDomainEvent<DeliberationConcludedPayload> {
	public static readonly type = "room:deliberation-concluded" as const;

	public constructor(
		aggregateId: string,
		payload: DeliberationConcludedPayload,
	) {
		super(DeliberationConcluded.type, aggregateId, "Room", payload);
	}
}
