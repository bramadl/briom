import { BaseDomainEvent } from "@briom/libs/drimion";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Payload carried by `RoomTopicGenerated` — the generated topic text
 * itself, so FE can typewriter-render it without a follow-up fetch.
 */
export interface RoomTopicGeneratedPayload extends BaseRoomDomainEventPayload {
	readonly topic: string;
}

/**
 * @description
 * Emitted when a Room's topic has been generated and attached.
 *
 * Fully decoupled from `DeliberationStarted` — this fires later, from a
 * separate async job, once the LLM call for topic summarization completes.
 * A Room can be DELIBERATING with turns already flowing while `topic` is
 * still null; FE's topic panel listens for this event independently of
 * the turn panel.
 */
export class RoomTopicGenerated extends BaseDomainEvent<RoomTopicGeneratedPayload> {
	public static readonly type = "room:topic-generated" as const;

	public constructor(aggregateId: string, payload: RoomTopicGeneratedPayload) {
		super(RoomTopicGenerated.type, aggregateId, "Room", payload);
	}
}
