import type { GenerateInput, LlmGateway } from "@briom/domain/orchestrator";
import { type IResult, Result } from "@briom/libs/drimion";
import type { OpenRouter } from "@openrouter/sdk";
import type { SendChatCompletionRequestResponse } from "@openrouter/sdk/models/operations";

import {
	ModelNotFoundError,
	RateLimitedError,
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
	): Promise<IResult<ReadableStream<string>, OpenRouterStreamErrors>> {
		let eventStream: SendChatCompletionRequestResponse;
		try {
			eventStream = await this.client.chat.send({
				chatRequest: {
					stream: true,
					model: input.qualifiedModel,
					messages: [
						{ role: "system", content: input.systemPrompt },
						...input.messages,
					],
				},
			});
		} catch (error) {
			const errors: OpenRouterStreamErrors = this.classifyError(
				error,
				input.qualifiedModel,
			);
			return Result.error(errors);
		}

		const readable = new ReadableStream<string>({
			async start(controller) {
				try {
					for await (const chunk of eventStream) {
						const delta = chunk.choices[0]?.delta?.content;
						if (delta) controller.enqueue(delta);
					}
					controller.close();
				} catch {
					controller.error(new StreamFailureError());
				}
			},
		});

		return Result.success(readable);
	}

	private classifyError(error: unknown, model: string): OpenRouterStreamErrors {
		if (isOpenRouterSDKError(error)) {
			const retryAfter = error.error.metadata?.retry_after_seconds;
			switch (error.statusCode) {
				case 404:
					return new ModelNotFoundError(model);
				case 429:
					return new RateLimitedError(
						model,
						retryAfter ? Number(retryAfter) : undefined,
					);
				// case 400:
				// case 401:
				// case 402:
				// case 403:
				// case 408:
				// case 413:
				// case 422:
				// case 500:
				// case 502:
				// case 503:
				// case 524:
				// case 529:
				default:
					return new StreamFailureError();
			}
		}

		return new StreamFailureError();
	}
}
