import { BaseDomainEvent } from "@briom/libs/drimion";

import type { RoomId } from "../../room";
import type { StreamError } from "../streams";
import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a turn encounters an unrecoverable error during streaming.
 *
 * The turn transitions to `FAILED` status. The error details enable the
 * application layer to decide whether to retry, abandon, or surface to user.
 */
export interface TurnFailedPayload extends BaseTurnEventPayload {
	readonly error: StreamError;
	readonly roomId: RoomId;
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
