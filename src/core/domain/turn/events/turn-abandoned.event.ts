import { BaseDomainEvent } from "@briom/libs/drimion";

import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

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
