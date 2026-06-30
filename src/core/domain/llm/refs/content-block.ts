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
