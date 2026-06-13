import type {
	GenerateInput,
	Generation,
	LlmGateway,
} from "@briom/domain/orchestrator";
import type { OpenRouter } from "@openrouter/sdk";

import { SDKError } from "./error.util";

export class OpenRouterLlmGateway implements LlmGateway {
	public constructor(private readonly client: OpenRouter) {}

	public async generate(input: GenerateInput): Promise<Generation> {
		try {
			const response = await this.client.chat.send({
				chatRequest: {
					model: input.qualifiedModel,
					messages: [
						{ role: "system", content: input.systemPrompt },
						...input.messages,
					],
				},
			});

			const content = response.choices[0].message.content;
			if (!content) {
				throw new Error("OpenRouter returned empty content");
			}

			return { content };
		} catch (error) {
			if (SDKError.isSDKError(error)) SDKError.processThenThrow(error);
			console.error("[OpenRouter] Unexpected Error :: ", error);
			throw new Error(
				error instanceof Error ? error.message : "Internal provider error",
			);
		}
	}
}
