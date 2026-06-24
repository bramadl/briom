import type { IResult } from "@briom/libs/drimion";

import type { Message, StreamError } from "../turn";

/**
 * @description
 * Input for LLM stream generation.
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
	 */
	qualifiedModel: string;

	/**
	 * @description
	 * Optional abort signal. When signalled, the gateway should cancel the
	 * in-flight request and allow the stream to throw an AbortError.
	 *
	 * Provided by `TurnStreamingService` when the moderator triggers an abort.
	 * Implementations must forward this to their HTTP/SDK layer.
	 */
	signal?: AbortSignal;

	/**
	 * @description System prompt establishing the participant's identity, room context, and intent. */
	systemPrompt: string;
}

/**
 * @description
 * `LlmGateway` — Domain Port (Query-like Contract)
 *
 * (See original file for full description.)
 */
export interface LlmGateway {
	/**
	 * @description
	 * Initiates a streaming LLM response for a participant turn.
	 *
	 * @param input - The generation context (messages, model, system prompt, signal)
	 * @returns Result containing a ReadableStream of tokens, or StreamError
	 */
	stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>>;
}
