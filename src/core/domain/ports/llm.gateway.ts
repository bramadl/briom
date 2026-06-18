import type { IResult } from "@briom/libs/drimion";

import type { Message, StreamError } from "../turn";

/**
 * @description
 * Input for LLM stream generation.
 *
 * Encapsulates everything needed to request a streaming response from an AI model:
 * the deliberation history (as messages), the target model, and the system prompt
 * that establishes context and intent.
 */
export interface GenerateInput {
	/**
	 * @description
	 * Deliberation history formatted as provider-agnostic messages.
	 */
	messages: Message[];

	/**
	 * @description
	 * Fully qualified model identifier for the LLM provider.
	 * Format: `{provider}/{model}` (e.g., "openai/gpt-4", "anthropic/claude-3.5-sonnet").
	 * @see ParticipantModel.qualify() — produces this format
	 */
	qualifiedModel: string;

	/**
	 * @description System prompt establishing the participant's identity, room context, and intent. */
	systemPrompt: string;
}

/**
 * @description
 * `LlmGateway` — Domain Port (Query-like Contract)
 *
 * Abstracts the LLM provider behind a domain-agnostic streaming interface.
 * The domain knows nothing about `OpenRouter`, `Claude`, `GPT`, or `Gemini` —
 * it only knows: "give me a stream of tokens for this model and prompt."
 *
 * **Why a Port, Not a Service?**
 * This is an infrastructure concern masquerading as a domain need. The domain
 * defines the contract (what it needs) but delegates implementation to the
 * infrastructure layer (how to get it). This keeps Briom provider-agnostic:
 * swapping `OpenRouter` for a custom proxy or local model requires only a new
 * adapter, zero domain changes.
 *
 * **Why ReadableStream<string>?**
 * The domain consumes tokens as they arrive — not as a complete response.
 * This enables real-time SSE forwarding to the client without buffering the
 * entire perspective. The stream abstraction is web-standard and works in both
 * Node.js and browser environments.
 *
 * **Error Handling**
 * All provider errors are normalized to domain `StreamError` instances:
 * - timeout: model didn't respond within threshold
 * - rate_limited: provider throttling
 * - model_not_found: invalid or unavailable model identifier
 * - stream_failure: generic connection/parsing failure
 *
 * @see StreamError — for error taxonomy
 * @see OpenRouterLlmGateway — infrastructure implementation
 */
export interface LlmGateway {
	/**
	 * @description
	 * Initiates a streaming LLM response for a participant turn.
	 *
	 * @param input - The generation context (messages, model, system prompt)
	 * @returns Result containing a ReadableStream of tokens, or StreamError
	 */
	stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>>;
}
