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
 * (See original file for full description.)
 *
 * **Abort support**
 * The `signal` field from `GenerateInput` is forwarded to the OpenRouter
 * `chat.send()` call. When the moderator aborts a turn, `TurnStreamingService`
 * calls `controller.abort()`, which propagates through the signal into the SDK's
 * HTTP layer. The SDK's async-iterable stops yielding chunks and throws an
 * `AbortError`. The streaming service's read loop catches this and transitions
 * the turn to FAILED with `StreamError.aborted()`.
 */
export class OpenRouterLlmGateway implements LlmGateway {
	public constructor(private readonly client: OpenRouter) {}

	public async stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>> {
		const { messages, qualifiedModel, systemPrompt, signal } = input;

		const fullMessages = [
			{ role: "system" as const, content: systemPrompt },
			...messages.map((m) => ({ role: m.role, content: m.content })),
		];

		try {
			const response = await this.client.chat.send(
				{
					chatRequest: {
						stream: true,
						model: qualifiedModel,
						messages: fullMessages,
					},
				},

				signal ? { fetchOptions: { signal } } : undefined,
			);

			const readable = new ReadableStream<string>({
				async start(controller) {
					let sawReasoningOnly = false;
					let sawAnyContent = false;

					try {
						for await (const chunk of response as unknown as AsyncIterable<{
							choices?: Array<{
								delta?: {
									content?: string;
									reasoning?: string;
									reasoning_details?: unknown[];
								};
							}>;
						}>) {
							if (signal?.aborted) {
								controller.error(
									new DOMException("Aborted by moderator", "AbortError"),
								);
								response.cancel();
								return;
							}

							const delta = chunk.choices?.[0]?.delta;
							if (!delta) continue;

							if (delta.content) {
								sawAnyContent = true;
								controller.enqueue(delta.content);
							} else if (delta.reasoning || delta.reasoning_details?.length) {
								sawReasoningOnly = true;
							}
						}

						if (sawReasoningOnly && !sawAnyContent) {
							console.warn(
								`[OpenRouterLlmGateway] Model "${qualifiedModel}" streamed reasoning but no content — turn will fail as empty.`,
							);
						}

						controller.close();
					} catch (error) {
						if (error instanceof DOMException && error.name === "AbortError") {
							controller.error(error);
							return;
						}

						const message = (error as Error).message;
						controller.error(StreamError.streamFailure(message));
						response.cancel(error);
					}
				},
			});

			return Result.success(readable);
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				throw error;
			}
			return Result.error(this.classifyError(error, qualifiedModel));
		}
	}

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
