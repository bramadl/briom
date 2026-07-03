import { BaseDomainEvent } from "@drimion";

import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a pending turn transitions to streaming status.
 *
 * Signals that the LLM connection is established and tokens will begin
 * flowing. Used by SSE subscribers to update UI from "thinking" to "streaming".
 */
export interface TurnStreamStartedPayload extends BaseTurnEventPayload {}

export class TurnStreamStarted extends BaseDomainEvent<TurnStreamStartedPayload> {
	public static readonly type = "turn:stream-started" as const;

	public constructor(aggregateId: string, payload: TurnStreamStartedPayload) {
		super(TurnStreamStarted.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
