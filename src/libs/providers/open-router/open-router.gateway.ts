import type { GenerateInput, LlmGateway } from "@briom/domain/orchestrator";
import type { OpenRouter } from "@openrouter/sdk";

import { SDKError } from "./error.util";

export class OpenRouterLlmGateway implements LlmGateway {
	public constructor(private readonly client: OpenRouter) {}

	public async stream(input: GenerateInput): Promise<ReadableStream<string>> {
		try {
			const eventStream = await this.client.chat.send({
				chatRequest: {
					stream: true,
					model: input.qualifiedModel,
					messages: [
						{ role: "system", content: input.systemPrompt },
						...input.messages,
					],
				},
			});

			return new ReadableStream<string>({
				async start(controller) {
					try {
						for await (const chunk of eventStream) {
							const delta = chunk.choices[0]?.delta?.content;
							if (delta) controller.enqueue(delta);
						}
						controller.close();
					} catch (err) {
						controller.error(err);
					}
				},
			});
		} catch (error) {
			throw SDKError.throwError(error);
		}
	}
}
