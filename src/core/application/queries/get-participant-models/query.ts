import type { GroupedParticipantModelsDTO } from "@briom/app/contracts";

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
