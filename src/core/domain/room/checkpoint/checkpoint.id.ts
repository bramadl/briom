import { Id, type UID } from "@drimion";

/**
 * @description
 * Unique identifier for a `Checkpoint` entity.
 */
export type CheckpointId = UID;
export const CheckpointId = (value?: string): CheckpointId => Id(value);
