import { BaseDomainEvent } from "@drimion";

import type { CheckpointId } from "../checkpoint/checkpoint.id";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Payload carried by `CheckpointInitiated` — the pre-allocated ID for the
 * Checkpoint about to be generated.
 */
export interface CheckpointInitiatedPayload extends BaseRoomDomainEventPayload {
	readonly checkpointId: CheckpointId;
}

/**
 * @description
 * Emitted when a Room pre-allocates an ID for a Checkpoint that is about
 * to be generated. Mirrors the claim-before-create pattern used by
 * `TurnSlotClaimed` — the application layer uses the returned ID to
 * instantiate the `Checkpoint` entity rather than relying on internal
 * ID generation at construction time.
 *
 * Not currently consumed by FE — kept distinct from `CheckpointGenerated`
 * (which fires once the summary is actually attached) so the two
 * lifecycle moments remain separately observable if needed later.
 */
export class CheckpointInitiated extends BaseDomainEvent<CheckpointInitiatedPayload> {
	public static readonly type = "room:checkpoint-initiated" as const;

	public constructor(aggregateId: string, payload: CheckpointInitiatedPayload) {
		super(CheckpointInitiated.type, aggregateId, "Room", payload);
	}
}
