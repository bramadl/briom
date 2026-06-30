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
	 * Lorem ipsum dolor sit amet.
	 */
	content: string | ContentBlock[];

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	role: Role;
}
