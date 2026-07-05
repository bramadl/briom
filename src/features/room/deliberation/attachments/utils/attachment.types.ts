import type { AttachmentContent } from "@briom/core/domain";

export type UploadStatus = "idle" | "uploading" | "error";

export interface PendingAttachment {
	content: AttachmentContent;
	localId: string;
	mediaType: "text" | "image";
	mimeType: string;
	name: string;
	sizeBytes: number;
	url: string;
}
