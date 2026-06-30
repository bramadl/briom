import { BaseDomainEvent } from "@briom/libs/drimion";

import type { CheckpointId } from "../checkpoint/checkpoint.id";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface CheckpointGeneratedPayload extends BaseRoomDomainEventPayload {
	readonly checkpointId: CheckpointId;
}

/**
 * @description
 * Emitted when a new Checkpoint has been attached to the Room.
 * Picked up via SSE so the UI can surface a small, informational notice —
 * not an upsell, just transparency about context compression having occurred.
 */
export class CheckpointGenerated extends BaseDomainEvent<CheckpointGeneratedPayload> {
	public static readonly type = "room:checkpoint-generated" as const;

	public constructor(aggregateId: string, payload: CheckpointGeneratedPayload) {
		super(CheckpointGenerated.type, aggregateId, "Room", payload);
	}
}
