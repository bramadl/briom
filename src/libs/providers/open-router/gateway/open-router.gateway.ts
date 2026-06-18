import { StreamError } from "@briom/core/domain";
import type {
	GenerateInput,
	LlmGateway,
} from "@briom/domain/ports/llm.gateway";
import { type IResult, Result } from "@briom/libs/drimion";
import type { OpenRouter } from "@openrouter/sdk";

import { isOpenRouterSDKError } from "../errors";

/**
 * @description
 * `OpenRouterLlmGateway` — Infrastructure Adapter
 *
 * Implements `LlmGateway` domain port using the OpenRouter SDK.
 * Translates between domain-agnostic GenerateInput and OpenRouter-specific
 * chat completion API, then wraps the response in a ReadableStream<string>.
 *
 * **Provider Agnosticism**
 * This is the ONLY file in the codebase that knows about `OpenRouter`.
 * The domain knows only `LlmGateway`. Swapping to `Anwthropic`, `Google`, or a
 * custom proxy requires only a new adapter implementing the same port.
 *
 * **Stream Transformation**
 * `OpenRouter` returns an `AsyncIterable` of chunk objects. This adapter
 * transforms that into a standard `ReadableStream<string>` that the domain
 * can consume token-by-token without knowing the provider format.
 *
 * **Error Normalization**
 * All OpenRouter errors are mapped to domain `StreamError` instances:
 * - 404 → model_not_found
 * - 429 → rate_limited (with retry_after if available)
 * - Other → stream_failure
 *
 * @see LlmGateway — domain contract
 * @see StreamError — domain error taxonomy
 */
export class OpenRouterLlmGateway implements LlmGateway {
	public constructor(private readonly client: OpenRouter) {}

	/**
	 * @description
	 * Initiates an LLM streaming response.
	 *
	 * @param input - Domain-agnostic generation request
	 * @returns Result containing `ReadableStream` of tokens, or `StreamError`
	 */
	public async stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>> {
		const { messages, qualifiedModel, systemPrompt } = input;

		const fullMessages = [
			{ role: "system" as const, content: systemPrompt },
			...messages.map((m) => ({ role: m.role, content: m.content })),
		];

		try {
			const response = await this.client.chat.send({
				chatRequest: {
					stream: true,
					model: qualifiedModel,
					messages: fullMessages,
				},
			});

			const readable = new ReadableStream<string>({
				async start(controller) {
					try {
						for await (const chunk of response as unknown as AsyncIterable<{
							choices: Array<{ delta: { content?: string } }>;
						}>) {
							const delta = chunk.choices[0]?.delta?.content;
							if (delta) {
								controller.enqueue(delta);
							}
						}
						controller.close();
					} catch (error) {
						const message = (error as Error).message;
						controller.error(StreamError.streamFailure(message));
						response.cancel(error);
					}
				},
			});

			return Result.success(readable);
		} catch (error) {
			return Result.error(this.classifyError(error, qualifiedModel));
		}
	}

	/**
	 * @description
	 * Classifies OpenRouter SDK errors into domain StreamError instances.
	 *
	 * @param error - Raw error from OpenRouter SDK
	 * @param model - Model identifier for error context
	 * @returns Domain-appropriate StreamError
	 */
	private classifyError(error: unknown, model: string): StreamError {
		if (isOpenRouterSDKError(error)) {
			const retryAfter = error.error.metadata?.retry_after_seconds;
			switch (error.statusCode) {
				case 404:
					return StreamError.modelNotFound(model);
				case 429:
					return StreamError.rateLimited(
						retryAfter ? Number(retryAfter) : undefined,
					);
				default:
					return StreamError.streamFailure(error.message);
			}
		}
		return StreamError.streamFailure("Failed to stream.");
	}
}
