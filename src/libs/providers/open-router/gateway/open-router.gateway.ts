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
 * **Why only `delta.content`, not `delta.reasoning`**
 * OpenRouter normalizes reasoning-capable models to also expose a
 * `delta.reasoning` (plaintext) / `delta.reasoning_details` (structured)
 * field, separate from `delta.content` — see
 * https://openrouter.ai/docs/guides/best-practices/reasoning-tokens. This
 * gateway intentionally forwards only `delta.content`: reasoning trace and
 * final perspective are different things domain-wise, and surfacing a
 * model's internal monologue as if it were its actual contribution would
 * misrepresent the `Turn`. If a model streams reasoning but never emits
 * any `delta.content`, the stream still completes "successfully" from
 * this adapter's point of view — the resulting empty content is caught
 * one layer up, in `TurnStreamingService`, which has the domain context
 * to fail the turn with a meaningful error instead of a generic one.
 *
 * **Error Normalization**
 * All OpenRouter errors are mapped to domain `StreamError` instances:
 * - 404 → model_not_found
 * - 429 → rate_limited (with retry_after if available)
 * - Other → stream_failure
 *
 * @see LlmGateway — domain contract
 * @see StreamError — domain error taxonomy
 * @see TurnStreamingService — where an empty-but-successful stream is
 * turned into a `StreamError.emptyResponse()` failure
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
					/**
					 * True once we've seen at least one chunk carrying
					 * `delta.reasoning` (or `delta.reasoning_details`)
					 * without any `delta.content` alongside it. Purely
					 * diagnostic — logged once at stream end if no content
					 * ever arrived, to make "model only ever reasoned"
					 * distinguishable in logs from "provider sent nothing
					 * at all" without changing what's enqueued to callers.
					 */
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
