import type { Brand } from "@briom/shared/brand";

export type AiProvider = Brand<string, "AiProvider">;
export const AiProvider = (value: string): AiProvider => value as AiProvider;
