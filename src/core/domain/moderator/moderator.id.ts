import { Id, type UID } from "@briom/libs/drimion";

export type ModeratorId = UID;
export const ModeratorId = (value?: string): ModeratorId => Id(value);
