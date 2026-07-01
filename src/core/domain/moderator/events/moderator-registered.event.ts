import { BaseDomainEvent } from "@briom/libs/drimion";

import type { ModeratorId } from "../moderator.id";

interface ModeratorRegisteredPayload {
	moderatorId: ModeratorId;
	occurredAt: Date;
}

/**
 * @description
 * Emitted when a new Moderator is registered.
 */
export class ModeratorRegistered extends BaseDomainEvent<ModeratorRegisteredPayload> {
	public static readonly type = "moderator:registered" as const;

	public constructor(aggregateId: string, payload: ModeratorRegisteredPayload) {
		super(ModeratorRegistered.type, aggregateId, "Moderator", payload);
	}
}
