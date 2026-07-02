import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a Room releases its turn slot after a participant turn
 * reaches a terminal state (settled, failed-and-abandoned).
 *
 * FE listens for this to re-enable the moderator input, turn proposals,
 * and retry actions — the counterpart signal to `TurnSlotClaimed`.
 */
export interface TurnSlotReleasedPayload extends BaseRoomDomainEventPayload {}

export class TurnSlotReleased extends BaseDomainEvent<TurnSlotReleasedPayload> {
	public static readonly type = "room:turn-slot-released" as const;

	public constructor(aggregateId: string, payload: BaseRoomDomainEventPayload) {
		super(TurnSlotReleased.type, aggregateId, "Room", payload);
	}
}
