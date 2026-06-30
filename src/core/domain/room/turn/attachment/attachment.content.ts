/**
 * @description
 * Content payload for a TEXT attachment — plain text already extracted
 * from the source file (PDF, code, markdown, etc.) by the FE before upload.
 */
export type TextAttachmentContent = {
	/**
	 * @description
	 * Discriminant tag identifying this as the text variant.
	 */
	mediaType: "text";

	/**
	 * @description
	 * The extracted plain text content, ready to be injected inline into
	 * the moderator turn's message as an `<attached>` block.
	 */
	text: string;
};

/**
 * @description
 * Content payload for an IMAGE attachment — a base64 data URI produced by
 * the FE before upload, ready to forward as a multimodal `image_url` block.
 */
export type ImageAttachmentContent = {
	/**
	 * @description
	 * Discriminant tag identifying this as the image variant.
	 */
	mediaType: "image";

	/**
	 * @description
	 * The base64-encoded data URI representing the image.
	 */
	base64: string;
};

/**
 * @description
 * The parsed payload of an `Attachment` — either extracted plain text or
 * a base64 image data URI, discriminated by `mediaType`.
 */
export type AttachmentContent = TextAttachmentContent | ImageAttachmentContent;

/**
 * @description
 * Narrows AttachmentContent to text variant.
 */
export function isTextContent(
	c: AttachmentContent,
): c is TextAttachmentContent {
	return c.mediaType === "text";
}

/**
 * @description
 * Narrows AttachmentContent to image variant.
 */
export function isImageContent(
	c: AttachmentContent,
): c is ImageAttachmentContent {
	return c.mediaType === "image";
}
