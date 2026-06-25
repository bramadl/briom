/**
 * @description
 * Data transfer object for a single AI model available through a provider.
 *
 * Represents a model that can be invited as a `Participant` into a Room.
 * The `qualifiedModel` field matches OpenRouter's `{provider}/{model}` format.
 */
export interface ParticipantModelDTO {
	/**
	 * @description
	 * Fully qualified identifier in `{provider}/{model}` format.
	 * Example: `"openai/gpt-4"`, `"anthropic/claude-3.5-sonnet"`.
	 */
	id: string;

	/**
	 * @description
	 * Whether the model pricing has all keys summed to 0.
	 * Computed by infrastructure based on OpenRouter pricing data.
	 */
	isFree: boolean;

	/**
	 * @description
	 * Model identifier without provider prefix (e.g., `"gpt-4"`, `"claude-3.5-sonnet"`).
	 */
	model: string;

	/**
	 * @description
	 * Human-readable model name for display in the UI.
	 * Example: `"GPT-4"`, `"Claude 3.5 Sonnet"`.
	 */
	name: string;

	/**
	 * @description
	 * Participant identifier (e.g., `"openai"`, `"anthropic"`, `"google"`).
	 */
	provider: string;

	/**
	 * @description
	 * Same as `id` — fully qualified model string for LLM gateway calls.
	 */
	qualifiedModel: string;
}

/**
 * @description
 * Grouped provider models, keyed by provider identifier.
 *
 * Each provider maps to an array of its available models, sorted alphabetically
 * by model name.
 */
export type GroupedParticipantModelsDTO = Record<string, ParticipantModelDTO[]>;
