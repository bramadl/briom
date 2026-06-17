import { BaseDomainEvent } from "@briom/libs/drimion";

import { Turn } from "../turn";
import type { TurnId } from "../turn.id";

import type { BaseTurnEventPayload } from "./base.event";

export interface TurnRetriedPayload
	extends Omit<BaseTurnEventPayload, "turnId"> {
	readonly newTurnId: TurnId;
	readonly previousTurnId: TurnId;
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
