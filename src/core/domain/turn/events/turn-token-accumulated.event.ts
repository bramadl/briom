import { BaseDomainEvent } from "@briom/libs/drimion";

import type { RoomId } from "../../room";
import { Turn } from "../turn";

import type { BaseTurnEventPayload } from "./base.event";

export interface TurnTokenAccumulatedPayload extends BaseTurnEventPayload {
	readonly roomId: RoomId;
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
