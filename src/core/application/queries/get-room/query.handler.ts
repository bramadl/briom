import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type { GetRoomInput, GetRoomOutput, GetRoomQuery } from "./query";

export class GetRoomHandler implements IQuery<GetRoomInput, GetRoomOutput> {
	constructor(private readonly query: GetRoomQuery) {}

	public async execute(input: GetRoomInput): Promise<IResult<GetRoomOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
