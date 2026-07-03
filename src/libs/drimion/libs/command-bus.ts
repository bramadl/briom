/** biome-ignore-all lint/suspicious/noExplicitAny: Unknown-type ahead. */

import type { AnyObject } from "@drimion/types";

import { Result } from "../libs/result";
import type { ICommand } from "../types/command.types";
import type { IResult } from "../types/result.types";
import { ApplicationError } from "./application-error";

type Constructor = new (...args: any[]) => any;

/**
 * @description
 * Thin message router for commands.
 */
export class CommandBus {
	private readonly handlers = new Map<Constructor, ICommand<any, any, any>>();

	/**
	 * @description
	 * Register a handler for a specific command class.
	 */
	register<TCommand, TOutput, E = ApplicationError>(
		CommandClass: Constructor,
		handler: ICommand<TCommand, TOutput, E>,
	): this {
		this.handlers.set(CommandClass, handler);
		return this;
	}

	/**
	 * @description
	 * Route a command instance to its registered handler.
	 */
	async execute<TOutput, E = ApplicationError, M = AnyObject>(
		command: any,
	): Promise<IResult<TOutput, E, M>> {
		if (command === null || typeof command !== "object") {
			return Result.error(
				ApplicationError.unexpected(
					"Command must be an object instance",
				) as unknown as E,
			) as IResult<TOutput, E, M>;
		}

		const Handler = this.handlers.get(command.constructor as Constructor);

		if (!Handler) {
			return Result.error(
				ApplicationError.unexpected(
					`No handler registered for "${command.constructor?.name ?? "Unknown"}"`,
				) as unknown as E,
			) as IResult<TOutput, E, M>;
		}

		try {
			return (await Handler.execute(command)) as IResult<TOutput, E, M>;
		} catch (err) {
			return Result.error(
				ApplicationError.unexpected((err as Error).message) as unknown as E,
			) as IResult<TOutput, E, M>;
		}
	}
}
