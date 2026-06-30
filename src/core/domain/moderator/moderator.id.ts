import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a `Moderator` —
 * the human user who guides deliberation.
 */
export type ModeratorId = UID;
export const ModeratorId = (value?: string): ModeratorId => Id(value);
