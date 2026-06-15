import type { AvailableModelDTO } from "./query.dto";

export type GetAvailableModelsInput = never;

export type GetAvailableModelsErrors = never;
export type GetAvailableModelsOutput = AvailableModelDTO[];

export class GetAvailableModelsQuery {
	public constructor(public readonly input: GetAvailableModelsInput) {}
}
