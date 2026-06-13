import type {
	GenerateInput,
	Generation,
	LlmGateway,
} from "@briom/domain/orchestrator";

export class OpenRouterLlmGateway implements LlmGateway {
	private readonly baseUrl = "https://openrouter.ai/api/v1";

	public constructor(private readonly apiKey: string) {}

	public async generate(input: GenerateInput): Promise<Generation> {
		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
				"HTTP-Referer": "https://briom.app",
				"X-Title": "Briom",
			},
			body: JSON.stringify({
				model: input.qualifiedModel,
				messages: [
					{ role: "system", content: input.systemPrompt },
					...input.messages,
				],
			}),
		});

		if (!response.ok) {
			throw new Error(
				`OpenRouter error: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (!content) {
			throw new Error("OpenRouter returned empty content");
		}

		return { content };
	}
}
