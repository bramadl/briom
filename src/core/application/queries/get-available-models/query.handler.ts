import { AiModel, AiProvider } from "@briom/core/domain";
import { type IQuery, type IResult, Result } from "@briom/libs/drimion";
import { SDKError } from "@briom/libs/providers/open-router/error.util";
import type { OpenRouter } from "@openrouter/sdk";

import type {
	GetAvailableModelsErrors,
	GetAvailableModelsOutput,
	GetAvailableModelsQuery,
} from "./query";
import { filterFreeModels } from "./query.service";

export class GetAvailableModelsHandler
	implements
		IQuery<
			GetAvailableModelsQuery,
			GetAvailableModelsOutput,
			GetAvailableModelsErrors
		>
{
	public constructor(
		private readonly client: OpenRouter,
		private readonly forceFreeModels?: boolean,
	) {}

	public async execute(
		_input: GetAvailableModelsQuery,
	): Promise<IResult<GetAvailableModelsOutput, never>> {
		try {
			const { data } = await this.client.models.list();

			const models = this.forceFreeModels ? filterFreeModels(data) : data;
			return Result.success(
				models.map((m) => {
					const [provider, model] = m.id.split("/") as [string, string];
					return {
						id: m.id,
						displayName: m.name,
						model: AiModel(model),
						provider: AiProvider(provider),
					};
				}),
			);
		} catch (error) {
			throw SDKError.throwError(error);
		}
	}
}
