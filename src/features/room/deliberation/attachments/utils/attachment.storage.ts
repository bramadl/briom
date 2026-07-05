import { createAuthClient } from "@briom/supabase/auth/client";

const BUCKET = "room-attachments" as const;

function extractStoragePath(url: string): string | null {
	const marker = `/${BUCKET}/`;
	const idx = url.indexOf(marker);
	return idx !== -1 ? url.slice(idx + marker.length) : null;
}

export async function uploadToStorage(
	roomId: string,
	file: File,
	mimeType: string,
): Promise<string> {
	const supabase = createAuthClient();
	const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const storagePath = `${roomId}/${Date.now()}-${sanitizedName}`;

	const { data, error } = await supabase.storage
		.from(BUCKET)
		.upload(storagePath, file, { contentType: mimeType, upsert: false });

	if (error || !data) throw new Error(error?.message ?? "Upload failed");

	const { data: urlData } = supabase.storage
		.from(BUCKET)
		.getPublicUrl(data.path);
	return urlData.publicUrl;
}

export async function removeFromStorage(url: string): Promise<void> {
	const path = extractStoragePath(url);
	if (!path) return;

	const supabase = createAuthClient();
	const { error } = await supabase.storage.from(BUCKET).remove([path]);
	if (error) {
		console.warn(
			`[AttachmentStorage] Failed to delete "${path}": ${error.message}`,
		);
	}
}

export async function removeManyFromStorage(urls: string[]): Promise<void> {
	const paths = urls
		.map(extractStoragePath)
		.filter((p): p is string => p !== null);
	if (paths.length === 0) return;

	const supabase = createAuthClient();
	const { error } = await supabase.storage.from(BUCKET).remove(paths);
	if (error) {
		console.warn("[AttachmentStorage] Failed to purge files:", error.message);
	}
}
