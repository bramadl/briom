import type { Role } from "./role";

/**
 * @description
 * A single content block within a multimodal LLM message.
 *
 * Used when a moderator turn carries an image attachment — the message
 * content becomes an array of blocks rather than a plain string, matching
 * the OpenAI/OpenRouter multimodal message format.
 *
 * Text blocks carry the turn text (and any `<attached>` text file blocks).
 * Image URL blocks carry a base64 data-URI for vision-capable models.
 */
export type ContentBlock =
	| { type: "text"; text: string }
	| { type: "image_url"; image_url: { url: string } };

/**
 * @description
 * A single message in the LLM conversation history.
 *
 * **Content shape**
 * - `string` — all text-only turns (moderator turns with no attachments, or
 *   with only text file attachments whose content has been injected inline).
 * - `ContentBlock[]` — moderator turns that include at least one image
 *   attachment. The array interleaves the text block (turn content + any
 *   `<attached>` text blocks) with `image_url` blocks for each image.
 *
 * **Not a domain concept** — this is a provider-agnostic DTO used by the
 * `TranscriptorRenderer` to format deliberation context for LLM consumption.
 * The domain uses `Turn`, not `Message`.
 */
export interface Message {
	content: string | ContentBlock[];
	role: Role;
}
