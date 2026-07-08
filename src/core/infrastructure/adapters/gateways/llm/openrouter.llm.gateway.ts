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

/**
 * @description
 * Hard ceiling on how long `pull()` will keep looping through empty-delta
 * chunks without seeing ANY delta content, before giving up on a stream
 * entirely. Some providers (caught here on `cohere/north-mini-code:free`)
 * send an unbounded run of role-only/metadata-only chunks with
 * `finishReason: null` and never actually terminate the stream on their
 * own — the original loop had no exit condition for that case, and spun
 * past 11,000 iterations before `StreamConsumer`'s outer `chunkTimeoutMs`
 * finally gave up and cancelled the reader out from under it. That race
 * is also what caused the "Invalid state: Controller is already closed"
 * crash — see `stopped` below.
 *
 * Deliberately time-based rather than a fixed chunk count: reasoning
 * models legitimately send hundreds of empty chunks in a row while
 * "thinking" before ever emitting a token (observed: 1131 consecutive
 * empty chunks from this same model, followed by a normal completion),
 * and chunk-arrival rate varies a lot between providers. A fixed count
 * threshold either fires on legitimately-slow-but-alive models, or has
 * to be set so high it stops being a useful guard against genuine stalls.
 * Wall-clock time since the last real delta is what actually
 * distinguishes "still thinking" from "dead" — a provider that's alive
 * keeps the connection warm and events keep arriving at SOME rate, even
 * if none of them carry content yet.
 */
const EMPTY_DELTA_STALL_TIMEOUT_MS = 90_000;

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
	 *
	 * Two further guards were added after a second incident
	 * (`cohere/north-mini-code:free`), where a provider sent an UNBOUNDED
	 * run of empty-delta chunks with `finishReason: null` and never
	 * terminated the stream at all:
	 *
	 * 1. `EMPTY_DELTA_STALL_TIMEOUT_MS` bounds how long the empty-delta
	 *    loop is willing to wait since the LAST real delta before giving
	 *    up, so a genuinely stalled provider is caught here instead of
	 *    relying on `StreamConsumer`'s outer per-chunk timeout to notice
	 *    first. Time-based rather than chunk-count-based deliberately —
	 *    see that constant's doc comment for why a count threshold isn't
	 *    a reliable signal here (reasoning models can legitimately send
	 *    1000+ empty chunks before responding).
	 * 2. `stopped` guards every controller call. Without it, if the outer
	 *    timeout DOES fire first and calls `reader.cancel()` (invoking
	 *    this stream's `cancel()`, which closes the controller), a
	 *    `pull()` call already in flight has no way to know that happened
	 *    — it would loop around, eventually call `controller.enqueue()`
	 *    or `controller.close()`, and throw `Invalid state: Controller is
	 *    already closed`. Setting `stopped = true` inside `cancel()` and
	 *    checking it at every re-entry point in `pull()`'s loop closes
	 *    that race.
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

		/**
		 * @description
		 * Wall-clock timestamp of the last chunk that carried real delta
		 * content (or the stream's start, if none yet). Compared against
		 * `EMPTY_DELTA_STALL_TIMEOUT_MS` on every empty-delta chunk to
		 * decide whether the provider is still meaningfully alive.
		 */
		let lastDeltaAt = Date.now();

		/**
		 * @description
		 * Flags this stream as done from the gateway's own perspective
		 * (closed, errored, or cancelled) so any `pull()` call already in
		 * flight when that happens never touches the controller again
		 * afterwards. See the class-level doc comment on `stream()` for
		 * the race this closes.
		 */
		let stopped = false;

		const stream = new ReadableStream<string>({
			async pull(controller) {
				try {
					while (true) {
						if (stopped) return;

						const { done, value } = await iterator.next();

						if (stopped) return;

						if (done) {
							logger.info("OpenRouterLLMGateway.stream: iterator done", {
								model,
								chunkCount,
								emptyDeltaCount,
								enqueuedCharCount,
							});

							resolveUsageOnce();
							stopped = true;
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
							stopped = true;
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
							emptyDeltaCount = 0;
							lastDeltaAt = Date.now();
							enqueuedCharCount += delta.length;
							controller.enqueue(delta);
							return;
						}

						// No content in this chunk (role-only / metadata-only chunk,
						// commonly the first chunk from some free-tier models, or a
						// reasoning-phase heartbeat). Loop again instead of returning
						// without enqueuing — returning here was the original bug.
						// But bound how long we're willing to keep doing that with
						// no real delta at all — see EMPTY_DELTA_STALL_TIMEOUT_MS.
						emptyDeltaCount += 1;

						if (emptyDeltaCount === 1 || emptyDeltaCount % 10 === 0) {
							logger.warn(
								"OpenRouterLLMGateway.stream: chunk with no delta content, continuing loop",
								{
									model,
									chunkCount,
									emptyDeltaCount,
									msSinceLastDelta: Date.now() - lastDeltaAt,
									finishReason: value.choices[0]?.finishReason,
								},
							);
						}

						const msSinceLastDelta = Date.now() - lastDeltaAt;
						if (msSinceLastDelta >= EMPTY_DELTA_STALL_TIMEOUT_MS) {
							logger.error(
								"OpenRouterLLMGateway.stream: no delta content for too long, aborting stream as stalled",
								{
									model,
									chunkCount,
									emptyDeltaCount,
									msSinceLastDelta,
									stallTimeoutMs: EMPTY_DELTA_STALL_TIMEOUT_MS,
								},
							);

							resolveUsageOnce();
							stopped = true;
							controller.error(
								new Error(
									`OpenRouter stream stalled: no content for ${Math.round(
										msSinceLastDelta / 1000,
									)}s (${emptyDeltaCount} empty chunks), giving up`,
								),
							);
							return;
						}
					}
				} catch (error) {
					if (stopped) return;

					logger.error("OpenRouterLLMGateway.stream: pull() threw", {
						model,
						chunkCount,
						errorName: error instanceof Error ? error.name : typeof error,
						errorMessage:
							error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});

					resolveUsageOnce();
					stopped = true;
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

				stopped = true;
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
