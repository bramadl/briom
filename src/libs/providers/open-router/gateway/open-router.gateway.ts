import { StreamError } from "@briom/core/domain";
import type {
	GenerateInput,
	LlmGateway,
} from "@briom/domain/ports/llm.gateway";
import { type IResult, Result } from "@briom/libs/drimion";
import type { OpenRouter } from "@openrouter/sdk";
import {
	type ModelNotFoundError,
	type RateLimitedError,
	StreamFailureError,
} from "../errors";
import { isOpenRouterSDKError } from "../errors/error.util";

export type OpenRouterStreamErrors =
	| ModelNotFoundError
	| RateLimitedError
	| StreamFailureError;

export class OpenRouterLlmGateway implements LlmGateway {
	public constructor(private readonly client: OpenRouter) {}

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
						controller.error(new StreamFailureError());
						response.cancel(error);
					}
				},
			});

			return Result.success(readable);
		} catch (error) {
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
