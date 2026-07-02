import { BaseDomainEvent } from "@briom/libs/drimion";

import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted for each token received from the LLM stream.
 *
 * Carries the actual text chunk for real-time UI updates via SSE.
 * These events are frequent during streaming; subscribers should handle
 * them efficiently.
 */
export interface TurnTokenAccumulatedPayload extends BaseTurnEventPayload {
	readonly token: string;
}

export class TurnTokenAccumulated extends BaseDomainEvent<TurnTokenAccumulatedPayload> {
	public static readonly type = "turn:token-accumulated" as const;

	public constructor(
		aggregateId: string,
		payload: TurnTokenAccumulatedPayload,
	) {
		super(TurnTokenAccumulated.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
