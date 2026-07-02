/**
 * @description
 * A single content block within a multimodal LLM message.
 *
 * Used when a message carries an image attachment —
 * the message content becomes an array of blocks rather than
 * a plain string, matching the OpenAI/OpenRouter multimodal
 * message format.
 *
 * Text blocks carry the content (and any `<attached>` text
 * file blocks). Image URL blocks carry a base64 data-URI for
 * vision-capable models.
 */
export type ContentBlock =
	| { type: "text"; text: string }
	| { type: "image_url"; image_url: { url: string } };

/**
 * @description
 * A single message in the LLM conversation history.
 *
 * **Content shape**
 *
 * - `string` — all text-only message (or with only text file
 *    attachments whose content has been injected inline).
 *
 * - `ContentBlock[]` — message that include at least one image
 *    attachment. The array interleaves the text block (content +
 *    any `<attached>` text blocks) with `image_url` blocks
 *    for each image.
 */
export interface Message {
	/**
	 * @description
	 * The message payload — plain text for simple turns, or a `ContentBlock[]`
	 * array when at least one image attachment must ride alongside it.
	 */
	content: string | ContentBlock[];

	/**
	 * @description
	 * Which conversational role this message occupies in the LLM's history —
	 * USER for moderator turns, ASSISTANT for participant turns, SYSTEM for
	 * checkpoint summaries and other framing context.
	 */
	role: Role;
}

/**
 * @description
 * LLM message roles.
 *
 * Maps Briom's deliberation concepts to provider-agnostic
 * role identifiers:
 *
 * - `USER`: moderator turns (human direction)
 * - `ASSISTANT`: participant turns (AI reasoning)
 * - `SYSTEM`: context and instruction framing
 */
export const Role = {
	/**
	 * @description
	 * Maps Briom's moderator turns (human direction).
	 */
	USER: "user",

	/**
	 * @description
	 * Maps Briom's participant turns (AI reasoning).
	 */
	ASSISTANT: "assistant",

	/**
	 * @description
	 * Maps context and instruction framing.
	 */
	SYSTEM: "system",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export interface UsageInfo {
	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	completionTokens: number;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	costUsd: number;

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	promptTokens: number;
}
