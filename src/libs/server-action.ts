import { ApplicationError, type IResult } from "@drimion";

export function respond<T, E extends ApplicationError, M = unknown>(
	result: IResult<T, E, M>,
): { data: T; metaData: M } {
	if (result.isError()) throw result.error();
	return { data: result.value(), metaData: result.metaData() };
}

/**
 * @description
 * A function that wraps an unknown error (typically thrown
 * by server action's operation/respond) into a rich
 * `ApplicationError` object.
 *
 * @note
 * The naming makes it simple to follow:
 * `app(error)` -> means ApplicationError, in some way.
 */
export function app(error: unknown): ApplicationError {
	if (error instanceof ApplicationError) return error;
	throw new Error("Unexpected server action error");
}
