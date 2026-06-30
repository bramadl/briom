import { BaseDomainEvent } from "@briom/libs/drimion";

import type { RoomId } from "../../room.id";
import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

/**
 *
 * Emitted when a turn completes streaming and finalizes its perspective.
 *
 * The turn is now available as shared context for subsequent turns.
 * Content carries the complete, final perspective text.
 */
export interface TurnSettledPayload extends BaseTurnEventPayload {
	readonly content: string;
	readonly roomId: RoomId;
}

export class TurnSettled extends BaseDomainEvent<TurnSettledPayload> {
	public static readonly type = "turn:settled" as const;

	public constructor(aggregateId: string, payload: TurnSettledPayload) {
		super(TurnSettled.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
