import { BaseDomainEvent } from "@briom/libs/drimion";

import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when deliberation is concluded.
 *
 * The room transitions to `CONCLUDED` status. No further turns can be initiated.
 * The thinking session is complete.
 */
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
