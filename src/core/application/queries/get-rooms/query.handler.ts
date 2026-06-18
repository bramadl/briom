import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetRoomsInput, GetRoomsOutput, GetRoomsQuery } from "./query";

export class GetRoomsHandler implements IQuery<GetRoomsInput, GetRoomsOutput> {
	constructor(private readonly query: GetRoomsQuery) {}

	public async execute(input: GetRoomsInput): Promise<IResult<GetRoomsOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
