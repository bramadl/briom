import { Id, type UID } from "@briom/libs/drimion";

/**
 * @description
 * Unique identifier for a `Checkpoint` entity.
 */
export type CheckpointId = UID;
export const CheckpointId = (value?: string): CheckpointId => Id(value);
