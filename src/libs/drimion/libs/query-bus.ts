/** biome-ignore-all lint/suspicious/noExplicitAny: Unknown-type ahead. */

import type { AnyObject } from "@drimion/types";

import { Result } from "../libs/result";
import type { IQuery } from "../types/command.types";
import type { IResult } from "../types/result.types";
import { ApplicationError } from "./application-error";

type Constructor = new (...args: any[]) => any;

/**
 * @description
 * Thin message router for queries.
 */
export class QueryBus {
	has(CommandOrQueryClass: Constructor): boolean {
		return this.handlers.has(CommandOrQueryClass);
	}

	private readonly handlers = new Map<Constructor, IQuery<any, any, any>>();

	/**
	 * @description
	 * Register a handler for a specific command class.
	 */
	register<TQuery, TOutput, E = ApplicationError>(
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
	async execute<TOutput, E = ApplicationError, M = AnyObject>(
		query: any,
	): Promise<IResult<TOutput, E, M>> {
		if (query === null || typeof query !== "object") {
			return Result.error(
				ApplicationError.unexpected(
					"Query must be an object instance",
				) as unknown as E,
			) as IResult<TOutput, E, M>;
		}

		const Handler = this.handlers.get(query.constructor as Constructor);

		if (!Handler) {
			return Result.error(
				ApplicationError.unexpected(
					`No handler registered for "${query.constructor?.name ?? "Unknown"}"`,
				) as unknown as E,
			) as IResult<TOutput, E, M>;
		}

		try {
			return (await Handler.execute(query)) as IResult<TOutput, E, M>;
		} catch (err) {
			return Result.error(
				ApplicationError.unexpected((err as Error).message) as unknown as E,
			) as IResult<TOutput, E, M>;
		}
	}
}
