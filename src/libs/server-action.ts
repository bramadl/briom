import type { ApplicationError, IResult } from "@drimion";

export function respond<T, E extends ApplicationError, M = unknown>(
	result: IResult<T, E, M>,
): { data: T; metaData: M } {
	if (result.isError()) throw result.error();
	return { data: result.value(), metaData: result.metaData() };
}
