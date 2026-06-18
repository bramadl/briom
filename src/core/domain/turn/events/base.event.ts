import type { TurnId } from "../turn.id";

/**
 * @description
 * Base payload shape shared by all `Turn` domain events.
 */
export interface BaseTurnEventPayload {
	readonly occurredAt?: Date;
	readonly turnId: TurnId;
}
