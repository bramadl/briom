import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface DeliberationStartedPayload extends BaseRoomDomainEventPayload {
	readonly topic: string;
}

/**
 * @description
 * Emitted when deliberation begins and the topic is set.
 */
export class DeliberationStarted extends BaseDomainEvent<DeliberationStartedPayload> {
	public static readonly type = "room:deliberation-started" as const;

	public constructor(aggregateId: string, payload: DeliberationStartedPayload) {
		super(DeliberationStarted.type, aggregateId, "Room", payload);
	}
}
