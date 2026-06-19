export interface ServerError {
	error: {
		kind: string;
		message: string;
	};
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
