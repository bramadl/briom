import type { Model } from "@openrouter/sdk/models";

export interface GetAvailableModelsOutput {
	models: Model[];
}

export interface GetAvailableModelsQuery {
	execute(): Promise<GetAvailableModelsOutput>;
}
