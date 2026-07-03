import { Id, type UID } from "@drimion";

/**
 * @description
 * Unique identifier for a `Turn` aggregate.
 */
export type TurnId = UID;
export const TurnId = (value?: string): TurnId => Id(value);
