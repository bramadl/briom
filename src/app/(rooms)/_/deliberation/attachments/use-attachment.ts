"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { useDropzone } from "react-dropzone";

import { ROOM_SETTING } from "../../room/config/setting";
import {
	purgeAttachmentsFromStorage,
	removeAttachmentFromStorage,
	uploadAttachment,
} from "./attachment.storage";
import type { PendingAttachment, UploadStatus } from "./attachment.types";
import { validateFile } from "./attachment.utils";

export type { PendingAttachment };

export function useAttachment(roomId: string) {
	const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
	const [uploadError, setUploadError] = useState<string | null>(null);

	const canAddMore = attachments.length < ROOM_SETTING.MAX_ATTACHMENTS;
	const isUploading = uploadStatus === "uploading";

	const onPurge = useEffectEvent(() => {
		if (attachments.length > 0) purgeAttachmentsFromStorage(attachments);
	});

	useEffect(() => {
		window.addEventListener("beforeunload", onPurge);
		return () => {
			window.removeEventListener("beforeunload", onPurge);
			onPurge();
		};
	}, []);

	const addFile = useCallback(
		async (file: File): Promise<void> => {
			setUploadError(null);

			const validation = validateFile(file, attachments.length);
			if (!validation.ok) return setUploadError(validation.error);

			setUploadStatus("uploading");
			try {
				const url = await uploadAttachment(roomId, file, validation.mimeType);
				setAttachments((prev) => [
					...prev,
					{
						localId: crypto.randomUUID(),
						name: file.name,
						mimeType: validation.mimeType,
						sizeBytes: file.size,
						url,
					},
				]);
				setUploadStatus("idle");
			} catch (err) {
				setUploadStatus("error");
				setUploadError(
					err instanceof Error ? err.message : "Upload failed. Try again.",
				);
			}
		},
		[attachments.length, roomId],
	);

	const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
		accept: undefined,
		disabled: !canAddMore || isUploading,
		multiple: false,
		noClick: true,
		noKeyboard: true,
		onDrop: ([file]) => {
			if (file) addFile(file);
		},
	});

	const removeAttachment = useCallback(
		async (localId: string) => {
			const target = attachments.find((a) => a.localId === localId);
			setAttachments((prev) => prev.filter((a) => a.localId !== localId));
			setUploadError(null);
			if (target) await removeAttachmentFromStorage(target.url);
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
