import type { Brand } from "@briom/shared/brand";

/**
 * A model from a specific AI Provider
 *
 * @example
 * "claude-sonnet-4-6", "gpt-5-5", "gemini-flash"
 */
export type AiModel = Brand<string, "AiModel">;
export const AiModel = (value: string): AiModel => value as AiModel;

/**
 * A model from a specific AI Provider
 *
 * @example
 * "anthropic/claude-sonnet-4-6"
 */
export type QualifiedModel = Brand<string, "QualifiedModel">;
export const QualifiedModel = (value: string): QualifiedModel =>
	value as QualifiedModel;
