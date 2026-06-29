export interface PendingAttachment {
	localId: string;
	mimeType: string;
	name: string;
	sizeBytes: number;
	url: string;
}

export type UploadStatus = "idle" | "uploading" | "error";

export type AttachmentMediaCategory = "text" | "image";
