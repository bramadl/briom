import { type IQuery, type IResult, Result } from "@briom/libs/drimion";
import type {
	GetTurnProposalsInput,
	GetTurnProposalsOutput,
	GetTurnProposalsQuery,
} from "./query";

/**
 * @description
 * `GetTurnProposalsHandler` — Query Handler
 *
 * Thin wrapper around `GetTurnProposalsQuery` enforcing the `IQuery` contract.
 * Converts raw query output into a `Result` for consistency with command
 * handlers across the application layer.
 *
 * **Why So Thin?**
 * Query handlers should be pass-through. Complex logic belongs in the query
 * implementation (domain service) or the domain. The handler's only job is
 * standardizing the return shape (Result) and enabling dependency injection.
 *
 * @see GetTurnProposalsQuery — for proposal generation logic
 */
export class GetTurnProposalsHandler
	implements IQuery<GetTurnProposalsInput, GetTurnProposalsOutput, never>
{
	/**
	 * @description
	 * Creates the query handler with the injected query port.
	 *
	 * @param query - The query port implementation
	 */
	public constructor(private readonly query: GetTurnProposalsQuery) {}

	/**
	 * @description
	 * Executes the turn proposals query.
	 *
	 * @param input - Room ID to retrieve proposals for
	 * @returns Result wrapping ranked proposals
	 */
	public async execute(
		input: GetTurnProposalsInput,
	): Promise<IResult<GetTurnProposalsOutput, never>> {
		const output = await this.query.execute(input);
		return Result.success(output);
	}
}
