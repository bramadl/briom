/**
 * @description
 * Attachment descriptor exposed to the FE.
 *
 * `textContent` is excluded — it was consumed by the LLM and is
 * too large to carry in the DTO. `url` is included so the FE can
 * offer a "view/download" link if needed.
 */
export interface RoomAttachmentDTO {
	mediaType: "text" | "image";
	mimeType: string;
	name: string;
	sizeBytes: number;
	url: string;
}
