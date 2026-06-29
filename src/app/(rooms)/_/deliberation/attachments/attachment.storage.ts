import { supabaseClient } from "@briom/supabase/client";

import { ROOM_SETTING } from "../../room/config/setting";
import type { PendingAttachment } from "./attachment.types";
import { extractStoragePath } from "./attachment.utils";

const { bucket } = ROOM_SETTING.STORAGE;

export async function uploadAttachment(
	roomId: string,
	file: File,
	mimeType: string,
): Promise<string> {
	const storagePath = `${roomId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

	const blob = new Blob([file], { type: mimeType });
	const { data, error } = await supabaseClient.storage
		.from(bucket)
		.upload(storagePath, blob, { contentType: mimeType, upsert: false });

	if (error || !data) throw new Error(error?.message ?? "Upload failed");
	const { data: urlData } = supabaseClient.storage
		.from(bucket)
		.getPublicUrl(data.path);

	return urlData.publicUrl;
}

export async function removeAttachmentFromStorage(url: string): Promise<void> {
	const path = extractStoragePath(url, bucket);
	if (!path) return;

	try {
		const { error } = await supabaseClient.storage.from(bucket).remove([path]);
		if (error) {
			console.warn(
				`[AttachmentStorage] Failed to delete "${path}": ${error.message}`,
			);
		}
	} catch (err) {
		console.warn(
			"[AttachmentStorage] Unexpected error removing attachment:",
			err,
		);
	}
}

export async function purgeAttachmentsFromStorage(
	targets: PendingAttachment[],
): Promise<void> {
	if (targets.length === 0) return;
	const paths = targets
		.map((t) => extractStoragePath(t.url, bucket))
		.filter(Boolean) as string[];

	if (paths.length === 0) return;
	try {
		await supabaseClient.storage.from(bucket).remove(paths);
	} catch (err) {
		console.warn("[AttachmentStorage] Failed to purge files:", err);
	}
}
