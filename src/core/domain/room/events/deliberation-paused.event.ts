import { BaseDomainEvent } from "@briom/libs/drimion";

import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when the moderator pauses deliberation.
 *
 * No new turns can be initiated until deliberation is resumed.
 */
export interface DeliberationPausedPayload extends BaseRoomDomainEventPayload {}

export class DeliberationPaused extends BaseDomainEvent<DeliberationPausedPayload> {
	public static readonly type = "room:deliberation-paused" as const;

	public constructor(aggregateId: string, payload: DeliberationPausedPayload) {
		super(DeliberationPaused.type, aggregateId, Room.name, payload);
	}
}
