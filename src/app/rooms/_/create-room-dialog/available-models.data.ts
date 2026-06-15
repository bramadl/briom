/**
 * Mirrors `AvailableModelDTO` from `getAvailableModels` (BE).
 *
 * - `provider` / `model` map directly to `AiProvider` / `AiModel` —
 *   passed verbatim to `inviteParticipant({ provider, model, ... })`.
 * - `displayName` is a human-readable label, used as the default
 *   `Participant.displayName` (editable by the user).
 */
export interface AvailableModelDTO {
	displayName: string;
	model: string;
	provider: string;
}

/**
 * Temporary placeholder list — replace with `briom.getAvailableModels()`
 * once the BE query is implemented (see `query.dto.ts` contract).
 */
export const PLACEHOLDER_MODELS: AvailableModelDTO[] = [
	{
		displayName: "Claude Sonnet 4.6",
		model: "claude-sonnet-4-6",
		provider: "anthropic",
	},
	{
		displayName: "Claude Opus 4.6",
		model: "claude-opus-4-6",
		provider: "anthropic",
	},
	{ displayName: "GPT-5.1", model: "gpt-5.1", provider: "openai" },
	{ displayName: "GPT-5 Mini", model: "gpt-5-mini", provider: "openai" },
	{ displayName: "Gemini 3 Pro", model: "gemini-3-pro", provider: "google" },
	{
		displayName: "Gemini 3 Flash",
		model: "gemini-3-flash",
		provider: "google",
	},
	{
		displayName: "Gemma 4 31B",
		model: "gemma-4-31b-it:free",
		provider: "google",
	},
	{
		displayName: "Llama 4 Maverick",
		model: "llama-4-maverick",
		provider: "meta-llama",
	},
];
