import { BaseDomainEvent } from "@drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room transitions from FORMING to DELIBERATING —
 * the first turn has been registered and the roster is now locked.
 *
 * Carries no topic — topic is a separate, async-generated piece of
 * metadata (see `RoomTopicGenerated`) that describes an already-started
 * deliberation, not a precondition for starting one.
 */
export interface DeliberationStartedPayload
	extends BaseRoomDomainEventPayload {}

export class DeliberationStarted extends BaseDomainEvent<DeliberationStartedPayload> {
	public static readonly type = "room:deliberation-started" as const;

	public constructor(aggregateId: string, payload: DeliberationStartedPayload) {
		super(DeliberationStarted.type, aggregateId, "Room", payload);
	}
}
