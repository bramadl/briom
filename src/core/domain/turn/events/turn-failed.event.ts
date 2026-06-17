import { BaseDomainEvent } from "@briom/libs/drimion";

import type { StreamError } from "../streams";
import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

export interface TurnFailedPayload extends BaseTurnEventPayload {
	readonly error: StreamError;
}

export class TurnFailed extends BaseDomainEvent<TurnFailedPayload> {
	public static readonly type = "turn:failed" as const;

	public constructor(aggregateId: string, payload: TurnFailedPayload) {
		super(TurnFailed.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
