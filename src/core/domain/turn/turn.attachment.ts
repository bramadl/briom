import { type DomainError, ValueObject } from "@briom/libs/drimion";

import {
	ATTACHMENT_MEDIA_TYPE,
	type AttachmentMediaType,
	AttachmentValidationError,
	IMAGE_MIME_TYPES,
	resolveMediaType,
	TEXT_MIME_TYPES,
} from "./attachments";

/**
 * @description
 * Maximum allowed sizes per media type.
 *
 * Text: 50 KB — keeps token amplification predictable across a room's
 * full turn history (50 KB ≈ ~12 500 tokens per LLM call).
 *
 * Image: 1 MB — vision models process images internally rather than
 * tokenizing them character-by-character, so the ceiling is higher.
 */
export const ATTACHMENT_SIZE_LIMIT = {
	[ATTACHMENT_MEDIA_TYPE.TEXT]: 50 * 1024,
	[ATTACHMENT_MEDIA_TYPE.IMAGE]: 1 * 1024 * 1024,
} as const satisfies Record<AttachmentMediaType, number>;

interface TurnAttachmentProps {
	/** Discriminator: how this attachment is rendered into LLM context. */
	mediaType: AttachmentMediaType;

	/** Full MIME type string (e.g. "text/plain", "image/png"). */
	mimeType: string;
	/** Original filename as uploaded by the moderator. */
	name: string;

	/** Raw file size in bytes. Validated against `ATTACHMENT_SIZE_LIMIT`. */
	sizeBytes: number;

	/**
	 * Pre-fetched file content.
	 *
	 * - Text attachments: the UTF-8 string content, fetched from Storage at
	 *   render time by `TranscriptorRenderer`. Never null for text attachments
	 *   once the renderer has resolved it.
	 *
	 * - Image attachments: always null — the `url` (base64 data-URI) is used
	 *   directly as a multimodal content block.
	 *
	 * Keeping content here (rather than re-fetching per LLM call) avoids
	 * repeated Storage reads when the same turn is rendered across retries.
	 */
	textContent: string | null;

	/**
	 * Supabase Storage URL.
	 * For text attachments this is used for display only — the resolved
	 * content is stored in `textContent`.
	 * For image attachments this is the base64 data-URI forwarded to the LLM.
	 */
	url: string;
}

/**
 * @description
 * `TurnAttachment` — Value Object
 *
 * An immutable file attached to a moderator turn. Its identity is fully
 * determined by its properties — there is no lifecycle beyond the turn
 * it belongs to.
 *
 * **Rendering contract**
 * - `TEXT` attachment → injected as `<attached name="…">…content…</attached>`
 *   block inside the moderator turn's USER message.
 * - `IMAGE` attachment → forwarded as an `image_url` content block in the
 *   multimodal content array for the same USER message.
 *
 * **Why not an Entity?**
 * Attachments have no independent lifecycle events. They are created with the
 * turn, stored alongside it, and never mutate. Equality by value is correct.
 *
 * **Invariants enforced here (not by callers):**
 * - MIME type must be in the supported set.
 * - File size must not exceed the per-media-type limit.
 * - `textContent` must be null for image attachments (images use URL/base64).
 */
export class TurnAttachment extends ValueObject<TurnAttachmentProps> {
	private constructor(props: TurnAttachmentProps) {
		super(props);
	}

	/**
	 * @description
	 * Creates a new `TurnAttachment` with full validation.
	 *
	 * Call this when the moderator first attaches a file (pre-upload flow).
	 * `textContent` may be null at construction time and resolved later by
	 * `TranscriptorRenderer` before the first LLM call that includes this turn.
	 */
	public static override isValidProps(
		props: TurnAttachmentProps,
	): DomainError | undefined {
		const mediaType = resolveMediaType(props.mimeType);
		if (!mediaType) {
			return new AttachmentValidationError(
				`Unsupported MIME type: ${props.mimeType}. ` +
					`Supported text types: ${[...TEXT_MIME_TYPES].join(", ")}. ` +
					`Supported image types: ${[...IMAGE_MIME_TYPES].join(", ")}.`,
			);
		}

		const limit = ATTACHMENT_SIZE_LIMIT[mediaType];
		if (props.sizeBytes > limit) {
			const limitKb = Math.round(limit / 1024);
			const actualKb = Math.round(props.sizeBytes / 1024);
			return new AttachmentValidationError(
				`${mediaType === ATTACHMENT_MEDIA_TYPE.TEXT ? "Text" : "Image"} attachment exceeds size limit: ${actualKb} KB > ${limitKb} KB.`,
			);
		}

		if (
			mediaType === ATTACHMENT_MEDIA_TYPE.IMAGE &&
			props.textContent !== null
		) {
			return new AttachmentValidationError(
				"Image attachments must have null textContent — use the url field for base64 data-URI.",
			);
		}
	}

	/**
	 * @description
	 * Rehydrates a `TurnAttachment` from persistence without re-validating.
	 * Used by the turn mapper when loading turns from the database.
	 */
	public static rehydrate(props: TurnAttachmentProps): TurnAttachment {
		return new TurnAttachment(props);
	}

	/**
	 * @description
	 * Returns a new `TurnAttachment` with `textContent` resolved.
	 * Called by `TranscriptorRenderer` after fetching file content from Storage.
	 */
	public withTextContent(content: string): TurnAttachment {
		if (this.get("mediaType") !== ATTACHMENT_MEDIA_TYPE.TEXT) {
			throw new Error("Cannot set textContent on an image attachment.");
		}
		return new TurnAttachment({ ...this.props, textContent: content });
	}

	/** Convenience getter — discriminates text vs image without importing the constant. */
	public get isText(): boolean {
		return this.get("mediaType") === ATTACHMENT_MEDIA_TYPE.TEXT;
	}

	public get isImage(): boolean {
		return this.get("mediaType") === ATTACHMENT_MEDIA_TYPE.IMAGE;
	}

	public get name(): string {
		return this.get("name");
	}

	public get url(): string {
		return this.get("url");
	}

	public get mediaType(): AttachmentMediaType {
		return this.get("mediaType");
	}

	public get mimeType(): string {
		return this.get("mimeType");
	}

	public get sizeBytes(): number {
		return this.get("sizeBytes");
	}

	public get textContent(): string | null {
		return this.get("textContent");
	}
}
