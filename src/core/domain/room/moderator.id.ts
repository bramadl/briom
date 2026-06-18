import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a `Moderator` — the human user who guides deliberation.
 *
 * In the MVP, each room has exactly one moderator. This ID represents that
 * human-led orchestration authority, distinguishing human identity from
 * AI participant identities.
 */
export type ModeratorId = UID;
export const ModeratorId = (value?: string): ModeratorId => Id(value);
