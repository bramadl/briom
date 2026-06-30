/**
 * @description
 * The two categories of file Briom accepts as moderator turn attachments.
 * Drives both validation (`SIZE_LIMIT`, `ALLOWED_MIME`) and how the
 * `TranscriptorRenderer` serializes the attachment into the LLM message.
 */
export const AttachmentMediaType = {
	/**
	 * @description
	 * Text-based file — PDF/doc/code parsed to plain text by FE.
	 *
	 * Content is injected verbatim as an `<attached>` block inside
	 * the moderator turn's message. The LLM reads it as plain text in its
	 * conversation history.
	 */
	TEXT: "text",

	/**
	 * @description
	 * Image file — converted to base64 data URI by FE.
	 *
	 * Content is forwarded as a multimodal `image_url` content block.
	 * Requires a vision-capable model at the OpenRouter gateway level.
	 */
	IMAGE: "image",
} as const;

export type AttachmentMediaType =
	(typeof AttachmentMediaType)[keyof typeof AttachmentMediaType];
