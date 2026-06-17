import type { Brand } from "@briom/shared/brand";

export type TurnId = Brand<string, "TurnId">;
export const TurnId = (value: string): TurnId => value as TurnId;
