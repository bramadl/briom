import { type IQuery, type IResult, Result } from "@briom/libs/drimion";
import type {
	GetParticipantModelsInput,
	GetParticipantModelsOutput,
	GetParticipantModelsQuery,
} from "./query";

/**
 * @description
 * `GetParticipantModelsHandler` — Query Handler
 *
 * Executes the `GetParticipantModelsQuery` through the injected query port.
 * Optionally filters to free models only based on server configuration.
 *
 * **Query vs Command**
 * Unlike commands, queries do not mutate state and do not emit domain events.
 * They are read-only operations that retrieve data from infrastructure.
 * Errors are propagated directly (not wrapped in `Result`) since there are
 * no domain invariants to enforce.
 *
 * **Why a Handler?**
 * Provides a uniform execution pattern across the application layer:
 * - Commands: `ICommand<Command, Output, Error>` with `execute()`
 * - Queries: `IQuery<Query, Output>` with `execute()`
 *
 * The handler is a thin wrapper that delegates to the query port, keeping
 * the application layer decoupled from infrastructure specifics.
 *
 * @see GetParticipantModelsQuery — for the actual data retrieval logic
 */
export class GetParticipantModelsHandler
	implements
		IQuery<GetParticipantModelsInput, GetParticipantModelsOutput, never>
{
	/**
	 * @description
	 * Creates the query handler with the injected query port.
	 *
	 * @param query - The query port implementation
	 * @param useFreeModels - Whether to filter free models only (from env/config)
	 */
	public constructor(
		private readonly query: GetParticipantModelsQuery,
		private readonly useFreeModels: boolean = false,
	) {}

	/**
	 * @description
	 * Retrieves participant models, optionally filtering to free models only.
	 *
	 * @param input - Query input (MVP: unused)
	 * @returns Grouped models with free-model flag
	 */
	public async execute(
		input: GetParticipantModelsInput,
	): Promise<IResult<GetParticipantModelsOutput, never, unknown>> {
		const output = await this.query.execute(input);
		return Result.success({
			models: output.models,
			useFreeModels: this.useFreeModels,
		});
	}
}
