/**
 * @description
 * Duck-typed interface for OpenRouter SDK error responses.
 *
 * OpenRouter errors have a nested structure with HTTP status code,
 * error message, and optional metadata (including retry guidance).
 */
interface OpenRouterSDKError {
	error: {
		code: number;
		message: string;
		metadata?: {
			raw: string;
			provider_name?: string;
			retry_after_seconds?: number;
		};
	};
	message: string;
	rawResponse?: Response;
	statusCode: number;
	userId?: string;
}

/**
 * Type guard for OpenRouter SDK errors.
 *
 * @param error - Unknown error to check
 * @returns True if error matches OpenRouter SDK error shape
 */
export function isOpenRouterSDKError(
	error: unknown,
): error is OpenRouterSDKError {
	return !!error && typeof error === "object" && "statusCode" in error;
}
