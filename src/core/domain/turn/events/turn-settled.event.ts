import { BaseDomainEvent } from "@briom/libs/drimion";

import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

export interface TurnSettledPayload extends BaseTurnEventPayload {
	readonly content: string;
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
