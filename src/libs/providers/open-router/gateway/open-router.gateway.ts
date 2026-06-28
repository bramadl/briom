import { StreamError } from "@briom/core/domain";
import type {
	GenerateInput,
	LlmGateway,
} from "@briom/domain/ports/llm.gateway";
import type {
	ContentBlock,
	Message,
} from "@briom/domain/turn/transcriptor/message";
import { type IResult, Result } from "@briom/libs/drimion";
import type { OpenRouter } from "@openrouter/sdk";
import type { ChatContentItems, ChatMessages } from "@openrouter/sdk/models";

import { isOpenRouterSDKError } from "../errors";

/**
 * @description
 * `OpenRouterLlmGateway` — Infrastructure Adapter
 *
 * Bridges the OpenRouter SDK to Briom's domain `LlmGateway` port.
 */
export class OpenRouterLlmGateway implements LlmGateway {
	public constructor(private readonly client: OpenRouter) {}

	public async stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>> {
		const { messages, qualifiedModel, systemPrompt, signal } = input;

		const fullMessages: ChatMessages[] = [
			{ role: "system", content: systemPrompt },
			...messages.map((m) => this.toSdkMessage(m)),
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
				signal ? { signal } : undefined,
			);

			const readable = new ReadableStream<string>({
				async start(controller) {
					let sawReasoningOnly = false;
					let sawAnyContent = false;

					if (signal?.aborted) {
						return controller.error(
							new DOMException(signal.reason ?? "Aborted", "AbortError"),
						);
					}

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
					const onAbort = async () => {
						try {
							await iterator.return?.();
						} catch {}

						controller.error(
							new DOMException(signal?.reason ?? "Aborted", "AbortError"),
						);
					};

					signal?.addEventListener("abort", onAbort, { once: true });
					try {
						while (true) {
							if (signal?.aborted) {
								try {
									await iterator.return?.();
								} catch {}

								return controller.error(
									new DOMException(signal.reason ?? "Aborted", "AbortError"),
								);
							}

							const { done, value: chunk } = await iterator.next();

							if (done) {
								if (sawReasoningOnly && !sawAnyContent) {
									console.warn(
										`[OpenRouterLlmGateway] Model "${qualifiedModel}" streamed reasoning but no content — turn will fail as empty.`,
									);
								}

								controller.close();
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
					} catch (error) {
						try {
							await iterator.return?.();
						} catch {}

						if (error instanceof DOMException && error.name === "AbortError") {
							controller.error(error);
							return;
						}

						const e = error instanceof Error ? error.message : "Stream failed";
						controller.error(StreamError.streamFailure(e));
					} finally {
						signal?.removeEventListener("abort", onAbort);
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

	/**
	 * @description
	 * Maps a domain `Message` to an SDK `ChatMessages` shape.
	 *
	 * - `string` content → passed through as-is (all non-image turns).
	 * - `ContentBlock[]` → mapped via `toSdkContent()` to `ChatContentItems[]`.
	 */
	private toSdkMessage(message: Message): ChatMessages {
		if (typeof message.content === "string") {
			return { role: message.role, content: message.content } as ChatMessages;
		}

		return {
			role: message.role,
			content: this.toSdkContent(message.content),
		} as ChatMessages;
	}

	/**
	 * @description
	 * Translates domain `ContentBlock[]` to SDK `ChatContentItems[]`.
	 *
	 * Domain uses the OpenAI wire format (`image_url` snake_case).
	 * OpenRouter SDK uses camelCase (`imageUrl`).
	 */
	private toSdkContent(blocks: ContentBlock[]): ChatContentItems[] {
		return blocks.map((block): ChatContentItems => {
			if (block.type === "text") return { type: "text", text: block.text };
			return {
				type: "image_url",
				imageUrl: { url: block.image_url.url },
			} as ChatContentItems;
		});
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
