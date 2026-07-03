import type { StreamError } from "@briom/core/domain";
import type { IResult } from "@drimion";

import type { Message, UsageInfo } from "./llm.ref";

/**
 * @description
 * Input for a single streaming completion request to an LLM provider.
 */
export interface GenerateInput {
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
 * Shared usage-reporting shape for both streaming and non-streaming
 * completions, since cost accounting doesn't care how the content
 * was delivered.
 */
interface WithUsage {
	/**
	 * @description
	 * Resolves once the provider reports usage — typically after all
	 * content deltas have been read. Always resolves; if the provider
	 * omits usage reporting (e.g. some free-tier models), the adapter
	 * resolves with a zero-cost `UsageInfo` instead of rejecting, so
	 * callers never need provider-specific fallback logic.
	 */
	usage: Promise<UsageInfo>;
}

/**
 * @description
 * Full non-streaming completion result: the whole response content
 * plus its usage, both available immediately.
 */
export interface CompleteOutput extends WithUsage {
	/**
	 * @description
	 * The complete generated text.
	 */
	content: string;
}

/**
 * @description
 * A streaming completion result: content arrives incrementally via
 * `stream`, while `usage` resolves separately once the provider has
 * finished reporting — usually after the last content delta.
 */
export interface StreamOutput extends WithUsage {
	/**
	 * @description
	 * Incremental text deltas as they arrive from the provider.
	 */
	stream: ReadableStream<string>;
}

/**
 * @description
 * Port to the upstream LLM aggregator (OpenRouter). Application-layer
 * services depend on this abstraction rather than any specific provider
 * SDK, keeping the domain and application layers free of HTTP/SDK concerns.
 */
export interface ILLMGateway {
	/**
	 * @description
	 * Bypass streaming and expect a full completed response.
	 */
	complete(input: GenerateInput): Promise<IResult<CompleteOutput, StreamError>>;
	/**
	 * @description
	 * Initiates a streaming LLM response.
	 */
	stream(input: GenerateInput): Promise<IResult<StreamOutput, StreamError>>;
}
