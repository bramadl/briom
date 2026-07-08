import type {
	CompleteOutput,
	GenerateInput,
	ILLMGateway,
	ILogger,
	StreamOutput,
} from "@briom/core/app";
import { StreamError } from "@briom/core/domain";
import type { OpenRouterClient } from "@briom/openrouter/client";
import { type IResult, Result } from "@drimion";
import type { EventStream } from "@openrouter/sdk/lib/event-streams.js";
import type { ChatMessages, ChatStreamChunk } from "@openrouter/sdk/models";
import * as errors from "@openrouter/sdk/models/errors";

type MessageContent = GenerateInput["messages"][number]["content"];

type ResolvedUsage = {
	promptTokens: number;
	completionTokens: number;
	costUsd: number;
};

/**
 * @description
 * `@openrouter/sdk` is Speakeasy-generated and retries on transient
 * errors (429s, timeouts, connection errors) using whatever backoff
 * policy is declared in OpenRouter's OpenAPI spec (`x-speakeasy-retries`)
 * unless overridden here. Left unbounded, a single struggling request
 * can silently retry for minutes before ever surfacing an error to our
 * code — which is indistinguishable from a genuine hang from the
 * caller's perspective, and is what let one turn burn the full Vercel
 * function budget. This bounds it to a handful of quick attempts: fail
 * fast and let OUR retry/error-surfacing logic (turn marked failed,
 * moderator sees it, can hit retry) take over instead.
 */
const BOUNDED_RETRY_CONFIG = {
	strategy: "backoff",
	backoff: {
		initialInterval: 250,
		maxInterval: 2_000,
		maxElapsedTime: 8_000,
		exponent: 1.5,
	},
	retryConnectionErrors: true,
} as const;

export class OpenRouterLLMGateway implements ILLMGateway {
	public constructor(
		private readonly client: OpenRouterClient,
		private readonly logger: ILogger,
	) {}

	public async complete(
		input: GenerateInput,
	): Promise<IResult<CompleteOutput, StreamError>> {
		this.logger.info("OpenRouterLLMGateway.complete: request start", {
			model: input.model,
			messageCount: input.messages.length,
		});

		try {
			const response = await this.client.chat.send(
				{
					chatRequest: {
						model: input.model,
						messages: this.toSdkMessages(input),
						stream: false,
					},
				},
				{ signal: input.signal, retries: BOUNDED_RETRY_CONFIG },
			);

			const rawContent = response.choices[0]?.message.content;
			const content = typeof rawContent === "string" ? rawContent : "";

			if (content.trim().length === 0) {
				this.logger.warn(
					"OpenRouterLLMGateway.complete: model returned empty content",
					{
						model: input.model,
						finishReason: response.choices[0]?.finishReason,
					},
				);

				return Result.error(StreamError.EMPTY_RESPONSE);
			}

			this.logger.info("OpenRouterLLMGateway.complete: success", {
				model: input.model,
				contentLength: content.length,
				usage: response.usage,
			});

			return Result.success({
				content,
				usage: Promise.resolve(this.toResolvedUsage(response.usage)),
			});
		} catch (error) {
			const mapped = this.mapError(error);

			this.logger.error("OpenRouterLLMGateway.complete: request failed", {
				model: input.model,
				mappedTo: mapped,
				errorName: error instanceof Error ? error.name : typeof error,
				errorMessage: error instanceof Error ? error.message : String(error),
			});

			return Result.error(mapped);
		}
	}

	/**
	 * @description
	 * Initiates a streaming LLM response. Only the initial `send()` call is
	 * classified into a typed `StreamError` — once the SDK's `EventStream`
	 * is in hand, failures past that point are surfaced by erroring the
	 * returned `ReadableStream` instead.
	 *
	 * `pull()` is written as a loop rather than a single `iterator.next()`
	 * call: many providers (this bug was caught on `openai/gpt-oss-20b:free`)
	 * send role-only / metadata-only chunks with no `delta.content` at all,
	 * especially as the very first chunk. A `pull()` that returns without
	 * enqueuing anything and without closing the stream is relying on the
	 * runtime to re-invoke `pull()` on its own — behavior that isn't
	 * guaranteed to be consistent across Node's web-streams implementation
	 * and the browser's, and in practice here it manifested as a stream
	 * that silently never delivered any tokens. Looping inside a single
	 * `pull()` call until something is actually enqueued (or the stream
	 * ends) removes that dependency entirely.
	 */
	public async stream(
		input: GenerateInput,
	): Promise<IResult<StreamOutput, StreamError>> {
		const initiateResult = await this.initiateStream(input);
		if (initiateResult.isError()) {
			return Result.error(initiateResult.error());
		}

		const sdkStream = initiateResult.value();
		const iterator = sdkStream[Symbol.asyncIterator]();

		let resolveUsage!: (usage: ResolvedUsage) => void;
		const usage = new Promise<ResolvedUsage>((resolve) => {
			resolveUsage = resolve;
		});

		let usageResolved = false;
		const resolveUsageOnce = (
			chatUsage?: Parameters<typeof this.toResolvedUsage>[0],
		) => {
			if (usageResolved) return;
			usageResolved = true;
			resolveUsage(this.toResolvedUsage(chatUsage));
		};

		const logger = this.logger;
		const model = input.model;

		let chunkCount = 0;
		let emptyDeltaCount = 0;
		let enqueuedCharCount = 0;

		const stream = new ReadableStream<string>({
			async pull(controller) {
				try {
					while (true) {
						const { done, value } = await iterator.next();

						if (done) {
							logger.info("OpenRouterLLMGateway.stream: iterator done", {
								model,
								chunkCount,
								emptyDeltaCount,
								enqueuedCharCount,
							});

							resolveUsageOnce();
							controller.close();
							return;
						}

						chunkCount += 1;

						if (value.error) {
							logger.error(
								"OpenRouterLLMGateway.stream: error chunk received",
								{
									model,
									chunkCount,
									errorType: value.error.metadata?.errorType ?? "unknown",
									errorMessage: value.error.message,
								},
							);

							resolveUsageOnce();
							controller.error(
								new Error(
									`OpenRouter stream error (${
										value.error.metadata?.errorType ?? "unknown"
									}): ${value.error.message}`,
								),
							);
							return;
						}

						if (value.usage) {
							logger.info("OpenRouterLLMGateway.stream: usage chunk received", {
								model,
								usage: value.usage,
							});

							resolveUsageOnce(value.usage);
						}

						const delta = value.choices[0]?.delta?.content;

						if (delta) {
							enqueuedCharCount += delta.length;
							controller.enqueue(delta);
							return;
						}

						// No content in this chunk (role-only / metadata-only chunk,
						// commonly the first chunk from some free-tier models).
						// Loop again instead of returning without enqueuing —
						// returning here was the original bug.
						emptyDeltaCount += 1;

						if (emptyDeltaCount === 1 || emptyDeltaCount % 10 === 0) {
							logger.warn(
								"OpenRouterLLMGateway.stream: chunk with no delta content, continuing loop",
								{
									model,
									chunkCount,
									emptyDeltaCount,
									finishReason: value.choices[0]?.finishReason,
								},
							);
						}
					}
				} catch (error) {
					logger.error("OpenRouterLLMGateway.stream: pull() threw", {
						model,
						chunkCount,
						errorName: error instanceof Error ? error.name : typeof error,
						errorMessage:
							error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});

					resolveUsageOnce();
					controller.error(error);
				}
			},

			async cancel(reason) {
				logger.warn("OpenRouterLLMGateway.stream: cancelled", {
					model,
					reason: typeof reason === "string" ? reason : String(reason),
					chunkCount,
					enqueuedCharCount,
				});

				resolveUsageOnce();

				try {
					await sdkStream.cancel(reason);
				} catch (cancelError) {
					logger.warn("OpenRouterLLMGateway.stream: sdkStream.cancel() threw", {
						model,
						errorMessage:
							cancelError instanceof Error
								? cancelError.message
								: String(cancelError),
					});
				}
			},
		});

		return Result.success({ stream, usage });
	}

	private async initiateStream(
		input: GenerateInput,
	): Promise<IResult<EventStream<ChatStreamChunk>, StreamError>> {
		try {
			const sdkStream = await this.client.chat.send(
				{
					chatRequest: {
						model: input.model,
						messages: this.toSdkMessages(input),
						stream: true,
					},
				},
				{ signal: input.signal, retries: BOUNDED_RETRY_CONFIG },
			);

			this.logger.info("OpenRouterLLMGateway.initiateStream: handshake OK", {
				model: input.model,
				hasAsyncIterator: typeof sdkStream[Symbol.asyncIterator] === "function",
			});

			return Result.success(sdkStream);
		} catch (error) {
			const mapped = this.mapError(error);

			this.logger.error(
				"OpenRouterLLMGateway.initiateStream: handshake FAILED",
				{
					model: input.model,
					mappedTo: mapped,
					errorName: error instanceof Error ? error.name : typeof error,
					errorMessage: error instanceof Error ? error.message : String(error),
				},
			);

			return Result.error(mapped);
		}
	}

	private toResolvedUsage(usage?: {
		promptTokens: number;
		completionTokens: number;
		cost?: number | null;
	}): ResolvedUsage {
		if (!usage) {
			this.logger.warn(
				"OpenRouterLLMGateway: usage was absent, defaulting to zero — provider likely omits usage reporting for this model",
			);
		}

		return {
			promptTokens: usage?.promptTokens ?? 0,
			completionTokens: usage?.completionTokens ?? 0,
			costUsd: usage?.cost ?? 0,
		};
	}

	private toSdkMessages(input: GenerateInput): ChatMessages[] {
		return [
			{ role: "system", content: input.systemPrompt } as ChatMessages,
			...input.messages.map(
				(message) =>
					({
						role: message.role,
						content: this.toSdkContent(message.content),
					}) as ChatMessages,
			),
		];
	}

	private toSdkContent(content: MessageContent) {
		if (typeof content === "string") return content;

		return content.map((block) => {
			if (block.type === "text") {
				return { type: "text" as const, text: block.text };
			}

			return {
				type: "image_url" as const,
				imageUrl: { url: block.image_url.url },
			};
		});
	}

	private mapError(error: unknown): StreamError {
		if (this.isAbortError(error)) return StreamError.ABORTED;

		if (error instanceof errors.TooManyRequestsResponseError) {
			return StreamError.RATE_LIMITED;
		}

		if (
			error instanceof errors.RequestTimeoutResponseError ||
			error instanceof errors.EdgeNetworkTimeoutResponseError
		) {
			return StreamError.TIMEOUT;
		}

		if (error instanceof errors.NotFoundResponseError) {
			return StreamError.MODEL_NOT_FOUND;
		}

		this.logger.error("OpenRouterLLMGateway: unmapped error → STREAM_FAILURE", {
			errorConstructorName: error?.constructor?.name,
			errorInstanceOf: Object.getPrototypeOf(error)?.constructor?.name,
			isError: error instanceof Error,
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		return StreamError.STREAM_FAILURE;
	}

	private isAbortError(error: unknown): boolean {
		if (error instanceof DOMException && error.name === "AbortError") {
			return true;
		}

		return (
			typeof error === "object" &&
			error !== null &&
			"name" in error &&
			(error as { name?: unknown }).name === "AbortError"
		);
	}
}
