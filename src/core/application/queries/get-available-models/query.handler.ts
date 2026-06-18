import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type {
	GetAvailableModelsOutput,
	GetAvailableModelsQuery,
} from "./query";

export class GetAvailableModelsHandler
	implements IQuery<void, GetAvailableModelsOutput>
{
	constructor(
		private readonly query: GetAvailableModelsQuery,
		private readonly useFreeModels?: boolean,
	) {}

	public async execute(): Promise<IResult<GetAvailableModelsOutput>> {
		const output = await this.query.execute();
		if (this.useFreeModels) {
			output.models = output.models.filter(
				(m) =>
					Object.values(m.pricing)
						.map(Number)
						.reduce((sum, value) => sum + value, 0) === 0,
			);
		}
		return Result.success(output);
	}
}
