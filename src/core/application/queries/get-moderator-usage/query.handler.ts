import type { IUsageRepository, TurnLimitPolicy } from "@briom/domain";
import {
	type DomainError,
	type IQuery,
	type IResult,
	Result,
} from "@briom/libs/drimion";

import type { GetModeratorUsageInput, GetModeratorUsageOutput } from "./query";

export class GetModeratorUsageHandler
	implements
		IQuery<GetModeratorUsageInput, GetModeratorUsageOutput, DomainError>
{
	public constructor(
		private readonly usageRepository: IUsageRepository,
		private readonly turnLimit: TurnLimitPolicy,
	) {}

	public async execute(
		input: GetModeratorUsageInput,
	): Promise<IResult<GetModeratorUsageOutput, DomainError, unknown>> {
		const usage = await this.usageRepository.getUsage(input.moderatorId);
		const used = usage?.count ?? 0;

		const now = new Date();
		const resetsAt = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			1,
		).toISOString();

		return Result.success({ used, limit: this.turnLimit.LIMIT, resetsAt });
	}
}
