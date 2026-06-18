import { BaseDomainEvent } from "@briom/libs/drimion";

import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a failed turn is permanently abandoned.
 *
 * The turn transitions to `ABANDONED` status. No further action is possible.
 * This is the terminal state for turns that the moderator chooses not to retry.
 */
export interface TurnAbandonedPayload extends BaseTurnEventPayload {}

export class TurnAbandoned extends BaseDomainEvent<TurnAbandonedPayload> {
	public static readonly type = "turn:abandoned" as const;

	public constructor(aggregateId: string, payload: TurnAbandonedPayload) {
		super(TurnAbandoned.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
