import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetTurnsInput, GetTurnsOutput, GetTurnsQuery } from "./query";

export class GetTurnsHandler implements IQuery<GetTurnsInput, GetTurnsOutput> {
	constructor(private readonly query: GetTurnsQuery) {}

	public async execute(input: GetTurnsInput): Promise<IResult<GetTurnsOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
