import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetTurnInput, GetTurnOutput, GetTurnQuery } from "./query";

export class GetTurnHandler implements IQuery<GetTurnInput, GetTurnOutput> {
	constructor(private readonly query: GetTurnQuery) {}

	public async execute(input: GetTurnInput): Promise<IResult<GetTurnOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
