import { BaseDomainEvent } from "@briom/libs/drimion";

import type { RoomId } from "../../room";
import { Turn } from "../turn";
import type { TurnSequence } from "../turn.sequence";

import type { BaseTurnEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a new turn is initiated (created) in the room.
 *
 * Signals that a contribution slot has been allocated. For participant turns,
 * this precedes the actual LLM streaming. For moderator turns, this and
 * `TurnSettled` are emitted together since moderator content is synchronous.
 */
export interface TurnInitiatedPayload extends BaseTurnEventPayload {
	readonly authorType: "moderator" | "participant";
	readonly roomId: RoomId;
	readonly sequence: TurnSequence;
}

export class TurnInitiated extends BaseDomainEvent<TurnInitiatedPayload> {
	public static readonly type = "turn:initiated" as const;

	public constructor(aggregateId: string, payload: TurnInitiatedPayload) {
		super(TurnInitiated.type, aggregateId, Turn.name, {
			occurredAt: new Date(),
			...payload,
		});
	}
}
