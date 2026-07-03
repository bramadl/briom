/** biome-ignore-all lint/suspicious/noExplicitAny: Unknown-type ahead. */

import { DomainError } from "../libs/domain-error";
import { Result } from "../libs/result";
import type { ICommand } from "../types/command.types";
import type { IResult } from "../types/result.types";

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
	register<TCommand, TOutput, E = DomainError>(
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
	async execute<TOutput, E = DomainError>(
		command: any,
	): Promise<IResult<TOutput, E>> {
		if (command === null || typeof command !== "object") {
			return Result.error(
				new DomainError("Command must be an object instance") as unknown as E,
			) as IResult<TOutput, E>;
		}

		const Handler = this.handlers.get(command.constructor as Constructor);

		if (!Handler) {
			return Result.error(
				new DomainError(
					`No handler registered for "${command.constructor?.name ?? "Unknown"}"`,
				) as unknown as E,
			) as IResult<TOutput, E>;
		}

		try {
			return (await Handler.execute(command)) as IResult<TOutput, E>;
		} catch (err) {
			return Result.error(
				new DomainError("Command execution failed", {
					cause: err,
				}) as unknown as E,
			) as IResult<TOutput, E>;
		}
	}
}
