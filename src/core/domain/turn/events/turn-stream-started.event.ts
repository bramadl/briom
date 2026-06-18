import { BaseDomainEvent } from "@briom/libs/drimion";

import type { RoomId } from "../../room";
import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

export interface TurnStreamStartedPayload extends BaseTurnEventPayload {
	roomId: RoomId;
}

export class TurnStreamStarted extends BaseDomainEvent<TurnStreamStartedPayload> {
	public static readonly type = "turn:stream-started" as const;

	public constructor(aggregateId: string, payload: TurnStreamStartedPayload) {
		super(TurnStreamStarted.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
