import type { Brand } from "@briom/shared/brand";

export type AiModel = Brand<string, "AiModel">;
export const AiModel = (value: string): AiModel => value as AiModel;

export type QualifiedModel = Brand<string, "QualifiedModel">;
export const QualifiedModel = (value: string): QualifiedModel =>
	value as QualifiedModel;
