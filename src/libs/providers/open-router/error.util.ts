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

export const SDKError = {
	isSDKError(error: unknown): error is OpenRouterSDKError {
		return !!error && typeof error === "object" && "statusCode" in error;
	},

	processThenThrow(error: OpenRouterSDKError): never {
		console.error(
			`[OpenRouter] ${error.statusCode} :: ${error.error.message}`,
			error,
		);

		if (error.statusCode === 404) {
			const provider =
				error.error.metadata?.provider_name ?? "Upstream provider";

			throw new Error(
				`OpenRouter API Error: [Provider/Model Not Found] ${provider} returned 404. The model might be offline or unavailable.`,
			);
		}

		if (error.statusCode === 429) {
			const retryAfter = error.error.metadata?.retry_after_seconds;
			if (retryAfter) {
				throw new Error(
					`OpenRouter API Error: [Rate limited] Please try again after ${retryAfter} seconds.`,
				);
			}

			throw new Error(
				"OpenRouter API Error: [Rate limited] Please try again later.",
			);
		}

		throw new Error(`OpenRouter API Error: ${error.error.message}`);
	},

	throwError(error: unknown): never {
		if (this.isSDKError(error)) this.processThenThrow(error);
		console.error("[OpenRouter] Stream Error :: ", error);
		throw new Error(
			error instanceof Error ? error.message : "Internal provider error",
		);
	},
};
