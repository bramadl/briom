/**
 * @description
 * `AttachmentMediaType` — Domain Constant
 *
 * Discriminates how a `TurnAttachment` is rendered into LLM context:
 *
 * - `text`: content is injected verbatim as an `<attached>` block inside
 *   the moderator turn's message. The LLM reads it as plain text in its
 *   conversation history.
 *
 * - `image`: content is forwarded as a multimodal `image_url` content block.
 *   Requires a vision-capable model at the OpenRouter gateway level.
 *
 * This distinction lives in the domain because `TranscriptorRenderer` uses it
 * to branch rendering logic — infrastructure must not decide this.
 */
export const ATTACHMENT_MEDIA_TYPE = {
	TEXT: "text",
	IMAGE: "image",
} as const;

export type AttachmentMediaType =
	(typeof ATTACHMENT_MEDIA_TYPE)[keyof typeof ATTACHMENT_MEDIA_TYPE];

/**
 * @description
 * MIME types recognized as text attachments.
 *
 * Any MIME not in this set and not in `IMAGE_MIME_TYPES` is rejected
 * by `RoomAttachmentPolicy`.
 */
export const TEXT_MIME_TYPES = new Set([
	"text/plain",
	"text/markdown",
	"text/x-typescript",
	"text/x-python",
	"text/javascript",
	"application/json",
	"application/x-yaml",
	"text/yaml",
	"text/x-go",
	"text/x-java",
	"text/html",
	"text/css",
]);

/**
 * @description
 * MIME types recognized as image attachments.
 *
 * SVG is intentionally excluded — it can embed scripts and poses a
 * security risk when forwarded to external LLM providers.
 */
export const IMAGE_MIME_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
]);

/**
 * @description
 * Resolves the `AttachmentMediaType` from a MIME type string.
 * Returns `null` if the MIME type is not supported.
 */
export function resolveMediaType(mimeType: string): AttachmentMediaType | null {
	if (TEXT_MIME_TYPES.has(mimeType)) return ATTACHMENT_MEDIA_TYPE.TEXT;
	if (IMAGE_MIME_TYPES.has(mimeType)) return ATTACHMENT_MEDIA_TYPE.IMAGE;
	return null;
}
