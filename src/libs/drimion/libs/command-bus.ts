import { DomainError } from "../libs/domain-error";
import { Result } from "../libs/result";
import type { ICommand } from "../types/command.types";
import type { IResult } from "../types/result.types";

type CommandConstructor = new (...args: unknown[]) => unknown;

/**
 * @description
 * Thin message router for commands.
 * No DI, no lifecycle — pure routing + execution.
 */
export class CommandBus {
	private readonly handlers = new Map<
		CommandConstructor,
		ICommand<unknown, unknown>
	>();

	/**
	 * @description
	 * Register a handler for a specific command class.
	 */
	register<Input, Output, E = DomainError>(
		CommandClass: new (...args: unknown[]) => Input,
		handler: ICommand<Input, Output, E>,
	): this {
		this.handlers.set(CommandClass, handler as ICommand<unknown, unknown>);
		return this;
	}

	/**
	 * @description
	 * Route a command instance to its registered handler.
	 * Always returns Result — never throws.
	 */
	async execute<Input, Output, E = DomainError>(
		command: Input,
	): Promise<IResult<Output, E>> {
		if (command === null || typeof command !== "object") {
			return Result.error(
				new DomainError(
					"Command must be an object instance, not a primitive",
				) as unknown as E,
			) as IResult<Output, E>;
		}

		const Handler = this.handlers.get(
			(command as object).constructor as CommandConstructor,
		);

		if (!Handler) {
			return Result.error(
				new DomainError(
					`No handler registered for command "${(command as object).constructor.name}"`,
				) as unknown as E,
			) as IResult<Output, E>;
		}

		try {
			return (await Handler.execute(command)) as IResult<Output, E>;
		} catch (err) {
			return Result.error(
				new DomainError("Unhandled command execution failure", {
					cause: err,
				}) as unknown as E,
			) as IResult<Output, E>;
		}
	}
}
