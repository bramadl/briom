import type { ServerError } from "./server-action";

export function parseError(error: Error): ServerError {
	return {
		success: false,
		error: {
			kind: error.constructor.name,
			message: error.message,
		},
	};
}
