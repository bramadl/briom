import type { ContentBlock } from "./content-block";
import type { Role } from "./role";

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
