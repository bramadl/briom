"use client";

import {
	useCallback,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from "react";
import { useDropzone } from "react-dropzone";

import { parseAttachmentContent } from "../utils/attachment.parser";
import {
	removeFromStorage,
	removeManyFromStorage,
	uploadToStorage,
} from "../utils/attachment.storage";
import type { PendingAttachment, UploadStatus } from "../utils/attachment.types";
import { validateFile } from "../utils/attachment.validator";

interface UseAttachmentOptions {
	canAttachFile: boolean;
	maxAttachments: number;
	roomId: string;
}

export function useAttachment({
	roomId,
	canAttachFile,
	maxAttachments,
}: UseAttachmentOptions) {
	const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
	const [uploadError, setUploadError] = useState<string | null>(null);

	const errorSeq = useRef(0);

	const canAddMore = canAttachFile && attachments.length < maxAttachments;
	const isUploading = uploadStatus === "uploading";

	const onPurge = useEffectEvent(() => {
		if (attachments.length > 0) {
			void removeManyFromStorage(attachments.map((a) => a.url));
		}
	});

	useEffect(() => {
		window.addEventListener("beforeunload", onPurge);
		return () => {
			window.removeEventListener("beforeunload", onPurge);
			onPurge();
		};
	}, []);

	const reportError = useCallback((message: string) => {
		errorSeq.current += 1;
		setUploadError(`${message}${"\u200b".repeat(errorSeq.current % 2)}`);
	}, []);

	const addFile = useCallback(
		async (file: File): Promise<void> => {
			setUploadError(null);

			const validation = validateFile(file, attachments.length, maxAttachments);
			if (!validation.ok || !validation.mediaType || !validation.mimeType) {
				setUploadStatus("idle");
				reportError(validation.error ?? "Invalid file.");
				return;
			}

			setUploadStatus("uploading");
			try {
				const [url, content] = await Promise.all([
					uploadToStorage(roomId, file, validation.mimeType),
					parseAttachmentContent(file, validation.mediaType),
				]);

				setAttachments((prev) => [
					...prev,
					{
						localId: crypto.randomUUID(),
						name: file.name,
						mimeType: validation.mimeType as string,
						sizeBytes: file.size,
						mediaType: validation.mediaType as "text" | "image",
						url,
						content,
					},
				]);
				setUploadStatus("idle");
			} catch (err) {
				setUploadStatus("idle");
				reportError(
					err instanceof Error ? err.message : "Upload failed. Try again.",
				);
			}
		},
		[attachments.length, maxAttachments, roomId, reportError],
	);

	const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
		disabled: !canAddMore || isUploading,
		multiple: false,
		noClick: true,
		noKeyboard: true,
		onDrop: ([file]) => {
			if (file) void addFile(file);
		},
	});

	const removeAttachment = useCallback(
		async (localId: string) => {
			const target = attachments.find((a) => a.localId === localId);
			setAttachments((prev) => prev.filter((a) => a.localId !== localId));
			setUploadError(null);
			if (target) await removeFromStorage(target.url);
		},
		[attachments],
	);

	const clear = useCallback(() => {
		setAttachments([]);
		setUploadError(null);
		setUploadStatus("idle");
	}, []);

	return {
		attachments,
		canAddMore,
		clear,
		getInputProps,
		getRootProps,
		isDragActive,
		isUploading,
		openPicker: open,
		removeAttachment,
		uploadError,
	};
}
