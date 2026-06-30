import type { IResult } from "@briom/libs/drimion";

import type { StreamError } from "./errors";
import type { Message } from "./refs";

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
interface GenerateInput {
	/**
	 * @description
	 * Conversation history formatted as provider-agnostic messages.
	 */
	messages: Message[];

	/**
	 * @description
	 * Fully qualified model identifier for the LLM provider.
	 * Format: `{provider}/{model}` (e.g., "openai/gpt-4").
	 */
	model: string;

	/**
	 * @description
	 * Optional abort signal.
	 *
	 * When signalled, the gateway should cancel the in-flight
	 * request and allow the stream to throw an `AbortError`.
	 */
	signal?: AbortSignal;

	/**
	 * @description
	 * System prompt establishing the deliberation and turns.
	 */
	systemPrompt: string;
}

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface LlmGateway {
	/**
	 * @description
	 * Initiates a streaming LLM response.
	 */
	stream(
		input: GenerateInput,
	): Promise<IResult<ReadableStream<string>, StreamError>>;
}
