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
 * Bridges the OpenRouter SDK to Briom's domain `LlmGateway` port.
 *
 * **Abort & Anti-Hang Strategy**
 * The OpenRouter SDK returns an async iterable that can silently stall
 * (TCP freeze, no data, no error, no EOF). A plain `for await` loop
 * would hang indefinitely.
 *
 * Fix: Use `Promise.race([iterator.next(), abortPromise])` so that:
 * - Manual abort (moderator) breaks the loop immediately
 * - Timeout abort (from `TurnLifecycleOrchestrator`) breaks the loop
 * - The iterator is properly closed via `iterator.return()` on abort
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

					const abortPromise = new Promise<never>((_, reject) => {
						if (signal?.aborted) {
							const exception = new DOMException(
								signal.reason ?? "Aborted",
								"AbortError",
							);

							reject(exception);
							return;
						}

						signal?.addEventListener(
							"abort",
							() => {
								const exception = new DOMException(
									signal.reason ?? "Aborted",
									"AbortError",
								);

								reject(exception);
							},
							{ once: true },
						);
					});

					const iterable = response as unknown as AsyncIterable<{
						choices?: Array<{
							delta?: {
								content?: string;
								reasoning?: string;
								reasoning_details?: unknown[];
							};
						}>;
					}>;

					const iterator = iterable[Symbol.asyncIterator]();
					try {
						while (true) {
							const result = await Promise.race([
								iterator.next(),
								abortPromise,
							]);

							if (result.done) {
								if (sawReasoningOnly && !sawAnyContent) {
									console.warn(
										`[OpenRouterLlmGateway] Model "${qualifiedModel}" streamed reasoning but no content — turn will fail as empty.`,
									);
								}

								controller.close();
								return;
							}

							const chunk = result.value;
							const delta = chunk.choices?.[0]?.delta;
							if (!delta) continue;

							if (signal?.aborted) {
								try {
									await iterator.return?.();
								} catch {}
								const exception = new DOMException(
									signal.reason ?? "Aborted",
									"AbortError",
								);

								controller.error(exception);
								return;
							}

							if (delta.content) {
								sawAnyContent = true;
								controller.enqueue(delta.content);
							} else if (delta.reasoning || delta.reasoning_details?.length) {
								sawReasoningOnly = true;
							}
						}
					} catch (error) {
						try {
							await iterator.return?.();
						} catch {}

						if (error instanceof DOMException && error.name === "AbortError") {
							controller.error(error);
							return;
						}

						const message =
							error instanceof Error ? error.message : "Stream failed";

						controller.error(StreamError.streamFailure(message));
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
