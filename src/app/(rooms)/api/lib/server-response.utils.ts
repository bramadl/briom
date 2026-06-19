import type { ServerResponse } from "./server-action";

export function parseResponse<T>(data: T): ServerResponse<T> {
	return {
		success: true,
		data,
	};
}
