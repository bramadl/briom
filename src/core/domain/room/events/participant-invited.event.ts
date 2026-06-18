import { BaseDomainEvent } from "@briom/libs/drimion";

import type { ParticipantId } from "../participant";
import { Room } from "../room";

import type { BaseRoomDomainEventPayload } from "./base.event";

/**
 * @description
 * Emitted when a new AI participant is invited to a room.
 *
 * The participant roster is now expanded; deliberation can begin once
 * at least one participant is present and a topic is set.
 */
export interface ParticipantInvitedPayload extends BaseRoomDomainEventPayload {
	readonly participantId: ParticipantId;
}

export class ParticipantInvited extends BaseDomainEvent<ParticipantInvitedPayload> {
	public static readonly type = "room:participant-invited" as const;

	public constructor(aggregateId: string, payload: ParticipantInvitedPayload) {
		super(ParticipantInvited.type, aggregateId, Room.name, payload);
	}
}
