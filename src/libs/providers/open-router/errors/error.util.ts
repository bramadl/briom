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

export function isOpenRouterSDKError(
	error: unknown,
): error is OpenRouterSDKError {
	return !!error && typeof error === "object" && "statusCode" in error;
}
