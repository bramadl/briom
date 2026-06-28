import { UnauthorizedError } from "@briom/supabase/utils/error";

export interface ServerError {
	error: { kind: string; message: string };
	success: false;
}

export interface ServerResponse<T> {
	data: T;
	success: true;
}

export type ServerActionResult<T> = ServerError | ServerResponse<T>;

export function isServerError<T>(
	result: ServerError | ServerResponse<T>,
): result is ServerError {
	return !result.success;
}

export function isServerResponse<T>(
	result: ServerError | ServerResponse<T>,
): result is ServerResponse<T> {
	return result.success;
}

export function parseError(error: Error): ServerError {
	return {
		success: false,
		error: { kind: error.constructor.name, message: error.message },
	};
}

export function parseResponse<T>(data: T): ServerResponse<T> {
	return { success: true, data };
}

export function unauthorizedError(): ServerError {
	return {
		success: false,
		error: { kind: "UnauthorizedError", message: "Unauthorized" },
	};
}

export function internalServerError(error: unknown): ServerError {
	console.error(error);
	return parseError(new Error("Internal server error"));
}

export function handleActionError(error: unknown): ServerError {
	if (error instanceof UnauthorizedError) return unauthorizedError();
	return internalServerError(error);
}

export function unwrapOrThrow<TOutput>(
	action: () => Promise<ServerActionResult<TOutput>>,
): () => Promise<ServerResponse<TOutput>>;

export function unwrapOrThrow<TInput, TOutput>(
	action: (input: TInput) => Promise<ServerActionResult<TOutput>>,
): (input: TInput) => Promise<ServerResponse<TOutput>>;

export function unwrapOrThrow(
	action: (input?: unknown) => Promise<ServerActionResult<unknown>>,
): (input?: unknown) => Promise<ServerResponse<unknown>> {
	return async (input?: unknown) => {
		const result = await action(input);
		if (isServerError(result)) throw new Error(result.error.message);
		return result;
	};
}
