import { DomainError } from "../libs/domain-error";
import { Result } from "../libs/result";
import type { IQuery } from "../types/command.types";
import type { IResult } from "../types/result.types";

type QueryConstructor = new (...args: unknown[]) => unknown;

/**
 * @description
 * Thin message router for queries.
 * No DI, no lifecycle — pure routing + execution.
 */
export class QueryBus {
	private readonly handlers = new Map<
		QueryConstructor,
		IQuery<unknown, unknown>
	>();

	/**
	 * @description
	 * Register a handler for a specific query class.
	 */
	register<Input, Output, E = DomainError>(
		QueryClass: new (...args: unknown[]) => Input,
		handler: IQuery<Input, Output, E>,
	): this {
		this.handlers.set(QueryClass, handler as IQuery<unknown, unknown>);
		return this;
	}

	/**
	 * @description
	 * Route a query instance to its registered handler.
	 * Always returns Result — never throws.
	 */
	async execute<Input, Output, E = DomainError>(
		query: Input,
	): Promise<IResult<Output, E>> {
		if (query === null || typeof query !== "object") {
			return Result.error(
				new DomainError(
					"Query must be an object instance, not a primitive",
				) as unknown as E,
			) as IResult<Output, E>;
		}

		const Handler = this.handlers.get(
			(query as object).constructor as QueryConstructor,
		);

		if (!Handler) {
			return Result.error(
				new DomainError(
					`No handler registered for query "${(query as object).constructor.name}"`,
				) as unknown as E,
			) as IResult<Output, E>;
		}

		try {
			return (await Handler.execute(query)) as IResult<Output, E>;
		} catch (err) {
			return Result.error(
				new DomainError("Unhandled query execution failure", {
					cause: err,
				}) as unknown as E,
			) as IResult<Output, E>;
		}
	}
}
