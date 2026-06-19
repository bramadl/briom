import type {
	GetParticipantModelsInput,
	GetParticipantModelsOutput,
	GetParticipantModelsQuery,
	GroupedParticipantModelsDTO,
	ParticipantModelDTO,
} from "@briom/core/application";
import type { OpenRouter } from "@openrouter/sdk";
import type { ModelsListResponse, PublicPricing } from "@openrouter/sdk/models";

/**
 * @description
 * `OpenRouterGetParticipantModelsQuery` — Infrastructure Query
 *
 * OpenRouter SDK implementation of `GetParticipantModelsQuery`.
 * Fetches the model catalog from OpenRouter and transforms it into a
 * provider-grouped, display-friendly format.
 *
 * **Transformation**
 * - Splits `id` (`"{provider}/{model}"`) into provider and model components
 * - Groups by provider identifier
 * - Sorts providers alphabetically, models by name
 * - Filters out models without valid `{provider}/{model}` IDs
 * - Computes `isFree` flag based on pricing sum === 0
 *
 * **Caching**
 * No internal caching — Tanstack Query handles caching at the client layer.
 * The underlying `openRouter.models.list()` call is lightweight.
 *
 * @see GetParticipantModelsQuery — application contract
 * @see openRouter — SDK client instance
 */
export class OpenRouterGetParticipantModelsQuery
	implements GetParticipantModelsQuery
{
	public constructor(private readonly client: OpenRouter) {}

	/**
	 * @description
	 * Fetches and transforms OpenRouter's model catalog.
	 *
	 * @param _input - Filter criteria (MVP: unused, all models returned)
	 * @returns Participant-grouped models with free-model metadata
	 */
	public async execute(
		_input: GetParticipantModelsInput,
	): Promise<GetParticipantModelsOutput> {
		const response = await this.client.models.list();

		const models = this.mapToGroupedModels(response.data);

		return { models, useFreeModels: false };
	}

	/**
	 * @description
	 * Transforms raw OpenRouter model list into grouped DTOs.
	 *
	 * @param data - Raw model list from OpenRouter SDK
	 * @returns Grouped and sorted provider models
	 */
	private mapToGroupedModels(
		data: ModelsListResponse["data"],
	): GroupedParticipantModelsDTO {
		const grouped: GroupedParticipantModelsDTO = {};

		for (const model of data) {
			const parts = model.id.split("/");

			// Skip malformed IDs that don't follow {provider}/{model} format
			if (parts.length !== 2) continue;

			const [provider, modelId] = parts as [string, string];
			const isFree = this.sumPricing(model.pricing) === 0;

			const dto: ParticipantModelDTO = {
				id: model.id,
				isFree,
				model: modelId,
				name: model.name || modelId,
				provider,
				qualifiedModel: model.id,
			};

			if (!grouped[provider]) {
				grouped[provider] = [];
			}

			grouped[provider].push(dto);
		}

		return Object.fromEntries(
			Object.entries(grouped)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([provider, models]) => [
					provider,
					models.sort((a, b) => a.name.localeCompare(b.name)),
				]),
		);
	}

	/**
	 * @description
	 * Sums all numeric values in a pricing object.
	 *
	 * Recursively handles nested objects, arrays, strings, and numbers.
	 * Returns 0 for null, undefined, or non-numeric values.
	 *
	 * @param pricing - OpenRouter pricing object
	 * @returns Total pricing sum
	 */
	private sumPricing(pricing: PublicPricing | null | undefined): number {
		if (!pricing) return 0;

		return Object.values(pricing).reduce<number>((sum, value) => {
			if (value === undefined || value === null) return sum;

			if (typeof value === "string") {
				const parsed = Number.parseFloat(value);
				return Number.isNaN(parsed) ? sum : sum + parsed;
			}

			if (typeof value === "number") {
				return sum + value;
			}

			return sum;
		}, 0);
	}
}
