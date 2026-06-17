import { Id, type UID } from "@briom/libs/drimion";

export type TurnId = UID;
export const TurnId = (value?: string): TurnId => Id(value);
