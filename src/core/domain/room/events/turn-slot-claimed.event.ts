import { BaseDomainEvent } from "@briom/libs/drimion";

import type { TurnId } from "../turn";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface TurnSlotClaimedPayload extends BaseRoomDomainEventPayload {
	readonly turnId: TurnId;
}

/**
 * @description
 * Emitted when a Room claims its turn slot for a new participant turn.
 *
 * This is the single signal FE needs to lock the moderator input, hide
 * turn proposals, and hide the retry button on any failed turn — derived
 * from one event instead of reconciling optimistic state, React Query
 * cache, and SSE independently.
 *
 * Intentionally NOT emitted for the internal moderator-turn claim/release
 * pair inside a single deliberation turn — that transition is silent
 * (see `Room.claimTurnSlot({ silent: true })`) since it resolves
 * synchronously and carries no useful signal for FE.
 */
export class TurnSlotClaimed extends BaseDomainEvent<TurnSlotClaimedPayload> {
	public static readonly type = "room:turn-slot-claimed" as const;

	public constructor(aggregateId: string, payload: TurnSlotClaimedPayload) {
		super(TurnSlotClaimed.type, aggregateId, "Room", payload);
	}
}
