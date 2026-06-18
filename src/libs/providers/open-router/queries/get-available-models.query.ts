// import type {
// 	GetAvailableModelsOutput,
// 	GetAvailableModelsQuery,
// } from "@briom/core/application";
// import type { OpenRouter } from "@openrouter/sdk";

// export class OpenRouterGetAvailableModelsQuery
// 	implements GetAvailableModelsQuery
// {
// 	constructor(private readonly client: OpenRouter) {}

// 	async execute(): Promise<GetAvailableModelsOutput> {
// 		const { data } = await this.client.models.list();
// 		return { models: data };
// 	}
// }
