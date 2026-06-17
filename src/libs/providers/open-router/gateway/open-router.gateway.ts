import type {
	GenerateInput,
	LlmGateway,
	Message,
} from "@briom/domain/orchestrator";
import { type IResult, Result } from "@briom/libs/drimion";
import type { OpenRouter } from "@openrouter/sdk";
import type { ChatMessages } from "@openrouter/sdk/models";
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
		const apiMessages = this.toTranscriptMode(input);

		let eventStream: SendChatCompletionRequestResponse;
		try {
			eventStream = await this.client.chat.send({
				chatRequest: {
					stream: true,
					model: input.qualifiedModel,
					messages: apiMessages,
				},
			});
		} catch (error) {
			return Result.error(this.classifyError(error, input.qualifiedModel));
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
				default:
					return new StreamFailureError();
			}
		}

		return new StreamFailureError();
	}

	private extractSpeaker(msg: Message): string {
		const match = msg.content.match(/^\[([^\]]+)\]:/);
		return match ? match[1] : msg.role === "user" ? "User" : "AI";
	}

	private stripSpeakerPrefix(content: string): string {
		return content.replace(/^\[[^\]]+\]:\s*/, "");
	}

	private toTranscriptMode(input: GenerateInput): ChatMessages[] {
		const transcript = input.messages
			.map((m) => {
				const speaker = this.extractSpeaker(m);
				return `${speaker}: ${this.stripSpeakerPrefix(m.content)}`;
			})
			.join("\n\n");

		return [
			{
				role: "system",
				content: `${input.systemPrompt}\n\nYou are participating in a live moderated discussion. Below is the shared conversation history. Respond naturally as yourself. Only provide your own response. Do not narrate. Do not generate dialogue for others.`,
			},
			{
				role: "user",
				content: `Discussion so far:\n\n${transcript}\n\nContinue the discussion naturally.`,
			},
		];
	}
}
