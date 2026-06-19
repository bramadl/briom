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

/**
 * @description
 * Input for `GetParticipantModelsQuery`.
 *
 * MVP: no filters. Extensible for provider-specific filtering or search.
 */
export interface GetParticipantModelsInput {
	/**
	 * @description
	 * Optional provider filter. If provided, only returns models for this provider.
	 */
	provider?: string;
}

/**
 * @description
 * Output from `GetParticipantModelsQuery`.
 */
export interface GetParticipantModelsOutput {
	/**
	 * @description
	 * Participant-grouped models available for participant invitation.
	 */
	models: GroupedParticipantModelsDTO;

	/**
	 * @description
	 * Whether the server is configured to filter free models only.
	 * Passed to FE so UI can show appropriate messaging.
	 */
	useFreeModels: boolean;
}

/**
 * @description
 * `GetParticipantModelsQuery` — Application Query Port
 *
 * Contract for retrieving the list of AI models available through the configured
 * LLM gateway (OpenRouter), grouped by provider.
 *
 * **Why a Port?**
 * Model discovery is an infrastructure concern (provider API, caching, format).
 * The application layer defines what it needs (grouped, display-friendly models)
 * but delegates how to fetch them to the infrastructure adapter.
 *
 * **Usage**
 * Called during room formation to populate the participant selector with
 * inviteable AI models.
 *
 * @see GetParticipantModelsHandler — for Result wrapping and error handling
 * @see OpenRouterGetProviderModelsQuery — infrastructure implementation
 */
export interface GetParticipantModelsQuery {
	/**
	 * @description
	 * Retrieves available AI models grouped by provider.
	 *
	 * @param input - Optional filter criteria (MVP: unused)
	 * @returns Grouped provider models with free-model metadata
	 */
	execute(
		input: GetParticipantModelsInput,
	): Promise<GetParticipantModelsOutput>;
}
