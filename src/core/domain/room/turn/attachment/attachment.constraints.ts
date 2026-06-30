import { AttachmentMediaType } from "./attachment.media-type";

const ONE_KB = 1024;
const ONE_MB = ONE_KB * ONE_KB;

/**
 * @description
 * Maximum allowed file size per `AttachmentMediaType`, in bytes.
 * Images get a much larger ceiling than text since a single image
 * is usually a few hundred KB to a few MB, while text attachments are
 * injected inline into the prompt and must stay small to control cost.
 */
export const SIZE_LIMIT = {
	/**
	 * @description
	 * Maximum size for TEXT attachments — 100 KB.
	 */
	[AttachmentMediaType.TEXT]: 100 * ONE_KB,

	/**
	 * @description
	 * Maximum size for IMAGE attachments — 1 MB.
	 */
	[AttachmentMediaType.IMAGE]: 1 * ONE_MB,
} as const satisfies Record<AttachmentMediaType, number>;

/**
 * @description
 * MIME types Briom accepts per `AttachmentMediaType`. Anything outside
 * these two lists is rejected by `resolveMediaType` and, in turn, by
 * `Attachment.isValidProps`.
 */
export const ALLOWED_MIME: Record<AttachmentMediaType, readonly string[]> = {
	/**
	 * @description
	 * MIME types recognized as text attachments.
	 *
	 * Any MIME not in this set and not in `IMAGE_MIME_TYPES` is rejected.
	 * @note FE parses PDF to plain text before sending
	 */
	[AttachmentMediaType.TEXT]: [
		"text/css",
		"text/csv",
		"text/html",
		"text/javascript",
		"text/markdown",
		"text/plain",
		"text/x-go",
		"text/x-java",
		"text/x-python",
		"text/x-typescript",
		"text/yaml",
		"application/json",
		"application/pdf",
		"application/x-yaml",
	],

	/**
	 * @description
	 * MIME types recognized as image attachments.
	 *
	 * SVG is intentionally excluded — it can embed scripts and poses a
	 * security risk when forwarded to external LLM providers.
	 */
	[AttachmentMediaType.IMAGE]: ["image/png", "image/jpeg", "image/webp"],
};

/**
 * @description
 * Resolves the `AttachmentMediaType` from a MIME type string.
 * Returns `null` if the MIME type is not supported.
 */
export function resolveMediaType(mimeType: string): AttachmentMediaType | null {
	if (mimeType.startsWith("text/")) return AttachmentMediaType.TEXT;
	for (const [type, mimes] of Object.entries(ALLOWED_MIME)) {
		if ((mimes as readonly string[]).includes(mimeType)) {
			return type as AttachmentMediaType;
		}
	}
	return null;
}
