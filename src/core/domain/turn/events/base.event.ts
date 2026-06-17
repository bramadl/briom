import type { TurnId } from "../turn.id";

export interface BaseTurnEventPayload {
	readonly occurredAt?: Date;
	readonly turnId: TurnId;
}
