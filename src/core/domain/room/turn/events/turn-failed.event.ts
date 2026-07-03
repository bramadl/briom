import { BaseDomainEvent } from "@drimion";

import { Turn } from "../turn";
import type { TurnError } from "../turn.error";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a turn encounters an unrecoverable error during streaming.
 *
 * The turn transitions to FAILED status. The error details enable the
 * application layer to decide whether to retry, abandon, or surface to user.
 */
export interface TurnFailedPayload extends BaseTurnEventPayload {
	readonly error: TurnError;
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
