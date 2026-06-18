import { type IQuery, type IResult, Result } from "@briom/libs/drimion";

import type {
	GetTurnsByRoomInput,
	GetTurnsByRoomOutput,
	GetTurnsByRoomQuery,
} from "./query";

export class GetTurnsByRoomHandler
	implements IQuery<GetTurnsByRoomInput, GetTurnsByRoomOutput>
{
	constructor(private readonly query: GetTurnsByRoomQuery) {}

	public async execute(
		input: GetTurnsByRoomInput,
	): Promise<IResult<GetTurnsByRoomOutput>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
