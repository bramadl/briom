/** biome-ignore-all lint/suspicious/noExplicitAny: Unknown-type ahead. */

import { DomainError } from "../libs/domain-error";
import { Result } from "../libs/result";
import type { IQuery } from "../types/command.types";
import type { IResult } from "../types/result.types";

type Constructor = new (...args: any[]) => any;

/**
 * @description
 * Thin message router for queries.
 */
export class QueryBus {
	private readonly handlers = new Map<Constructor, IQuery<any, any, any>>();

	/**
	 * @description
	 * Register a handler for a specific command class.
	 */
	register<TQuery, TOutput, E = DomainError>(
		QueryClass: Constructor,
		handler: IQuery<TQuery, TOutput, E>,
	): this {
		this.handlers.set(QueryClass, handler);
		return this;
	}

	/**
	 * @description
	 * Route a command instance to its registered handler.
	 */
	async execute<TOutput, E = DomainError>(
		query: any,
	): Promise<IResult<TOutput, E>> {
		if (query === null || typeof query !== "object") {
			return Result.error(
				new DomainError("Query must be an object instance") as unknown as E,
			) as IResult<TOutput, E>;
		}

		const Handler = this.handlers.get(query.constructor as Constructor);

		if (!Handler) {
			return Result.error(
				new DomainError(
					`No handler registered for "${query.constructor?.name ?? "Unknown"}"`,
				) as unknown as E,
			) as IResult<TOutput, E>;
		}

		try {
			return (await Handler.execute(query)) as IResult<TOutput, E>;
		} catch (err) {
			return Result.error(
				new DomainError("Query execution failed", {
					cause: err,
				}) as unknown as E,
			) as IResult<TOutput, E>;
		}
	}
}
