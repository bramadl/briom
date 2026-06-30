/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export type TextAttachmentContent = {
	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	mediaType: "text";

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	text: string;
};

/**
 * @description
 * Lorem ipsum dolor sit amet.
 */
export type ImageAttachmentContent = {
	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	mediaType: "image";

	/**
	 * @description
	 * Lorem ipsum dolor sit amet.
	 */
	base64: string;
};

/**
 * @description
 * Lorem ipsum dolor sit amet.
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
