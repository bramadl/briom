import { ValueObject, validator as v } from "@drimion";

import type { AttachmentContent } from "./attachment.content";
import { AttachmentMediaType } from "./attachment.media-type";
import { resolveMediaType, SIZE_LIMIT } from "./attachment.policy";
import { AttachmentValidationError } from "./errors/attachment-validation.error";

interface AttachmentProps {
	/**
	 * @description
	 * Parsed content produced by FE before upload:
	 * - TEXT → plain text string extracted from file
	 * - IMAGE → base64 data URI forwarded to LLM
	 */
	content: AttachmentContent;

	/**
	 * @description
	 * Resolved media category — TEXT or IMAGE.
	 */
	mediaType: AttachmentMediaType;

	/**
	 * @description
	 * Full MIME type string as reported by the browser.
	 */
	mimeType: string;

	/**
	 * @description
	 * Original filename as uploaded by the moderator.
	 */
	name: string;

	/**
	 * @description
	 * Raw file size in bytes.
	 */
	sizeBytes: number;

	/**
	 * @description
	 * External (Supabase) Storage URL — used for display in UI.
	 */
	url: string;
}

/**
 * @description
 * An immutable file attached to a moderator turn.
 *
 * FE is responsible for parsing all files before sending to BE:
 * - PDF/doc/code → plain text string
 * - Image → base64 data URI
 *
 * Domain validates MIME type, size, and content/mediaType consistency.
 * TranscriptorRenderer uses content directly — no fetch needed at render time.
 */
export class Attachment extends ValueObject<AttachmentProps> {
	private constructor(props: AttachmentProps) {
		super(props);
	}

	public static override isValidProps(
		props: AttachmentProps,
	): AttachmentValidationError | undefined {
		const resolved = resolveMediaType(props.mimeType);

		if (!resolved) {
			return new AttachmentValidationError(
				`Unsupported MIME type: ${props.mimeType}`,
			);
		}

		if (resolved !== props.mediaType) {
			return new AttachmentValidationError(
				`mediaType mismatch: MIME "${props.mimeType}" resolves to "${resolved}", got "${props.mediaType}"`,
			);
		}

		const limit = SIZE_LIMIT[props.mediaType];
		if (props.sizeBytes > limit) {
			const limitKb = Math.round(limit / 1024);
			const actualKb = Math.round(props.sizeBytes / 1024);
			return new AttachmentValidationError(
				`File exceeds size limit: ${actualKb} KB > ${limitKb} KB`,
			);
		}

		if (
			props.mediaType === AttachmentMediaType.TEXT &&
			props.content.mediaType !== "text"
		) {
			return new AttachmentValidationError(
				"TEXT attachment must have text content",
			);
		}

		if (
			props.mediaType === AttachmentMediaType.IMAGE &&
			props.content.mediaType !== "image"
		) {
			return new AttachmentValidationError(
				"IMAGE attachment must have image (base64) content",
			);
		}

		if (
			props.content.mediaType === "text" &&
			v.string(props.content.text).isEmpty()
		) {
			return new AttachmentValidationError("Text content cannot be empty");
		}

		if (
			props.content.mediaType === "image" &&
			v.string(props.content.base64).isEmpty()
		) {
			return new AttachmentValidationError("Base64 content cannot be empty");
		}
	}

	/**
	 * @description
	 * Max allowed size for a given media type.
	 *
	 * Exposed for UI feedback.
	 */
	public static maxSizeFor(mediaType: AttachmentMediaType): number {
		return SIZE_LIMIT[mediaType];
	}

	/**
	 * @description
	 * Parsed content produced by FE before upload:
	 * - TEXT → plain text string extracted from file
	 * - IMAGE → base64 data URI forwarded to LLM
	 */
	public get content(): AttachmentContent {
		return this.get("content");
	}

	/**
	 * @description
	 * Resolved media category — TEXT or IMAGE.
	 */
	public get mediaType(): AttachmentMediaType {
		return this.get("mediaType");
	}

	/**
	 * @description
	 * Full MIME type string as reported by the browser.
	 */
	public get mimeType(): string {
		return this.get("mimeType");
	}

	/**
	 * @description
	 * Original filename as uploaded by the moderator.
	 */
	public get name(): string {
		return this.get("name");
	}

	/**
	 * @description
	 * Raw file size in bytes.
	 */
	public get sizeBytes(): number {
		return this.get("sizeBytes");
	}

	/**
	 * @description
	 * External (Database) Storage URL — used for display in UI.
	 */
	public get url(): string {
		return this.get("url");
	}

	/**
	 * @description
	 * Wether the media type of this attachment is text.
	 */
	public get isText(): boolean {
		return this.get("mediaType") === AttachmentMediaType.TEXT;
	}

	/**
	 * @description
	 * Wether the media type of this attachment is image.
	 */
	public get isImage(): boolean {
		return this.get("mediaType") === AttachmentMediaType.IMAGE;
	}
}
