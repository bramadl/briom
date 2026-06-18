import { BaseDomainEvent } from "@briom/libs/drimion";

import { Turn } from "../turn";
import type { TurnId } from "../turn.id";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a failed turn is reset for retry.
 *
 * The turn returns to `PENDING` status, clearing all error state.
 * A subsequent `TurnInitiated` event follows immediately.
 */
export interface TurnRetriedPayload extends BaseTurnEventPayload {
	readonly turnId: TurnId;
}

export class TurnRetried extends BaseDomainEvent<TurnRetriedPayload> {
	public static readonly type = "turn:retried" as const;

	public constructor(aggregateId: string, payload: TurnRetriedPayload) {
		super(TurnRetried.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
