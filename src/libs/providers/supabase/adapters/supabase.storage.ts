import type { IAttachmentStorage } from "@briom/domain";
import { supabaseAdmin } from "@briom/supabase/admin";

/**
 * @description
 * `SupabaseAttachmentStorage` — Infrastructure Adapter
 *
 * Implements `IAttachmentStorage` using Supabase Storage.
 *
 * Called by `TranscriptorRenderer.render()` to fetch text file content
 * for any moderator turns that carry text attachments. Images are never
 * fetched here — they use the base64 data-URI stored in `TurnAttachment.url`.
 *
 * **Why fetch at render time, not at upload time?**
 * - Keeps `turns.attachments` JSONB lean (no large text blobs in DB).
 * - Supabase free tier has a 500 MB DB limit but 1 GB Storage limit.
 * - Render happens once per LLM call — not per token — so the overhead
 *   is bounded to 1 fetch per text attachment per participant turn.
 *
 * **Error handling**
 * A fetch failure returns an empty string. `TranscriptorRenderer` will
 * log a warning and skip the attachment rather than failing the whole
 * LLM call. This is intentional — a missing file should not break deliberation.
 *
 * **Bucket**
 * All room attachments live in the `room-attachments` bucket, which should
 * be configured as private (authenticated reads only). The server-side
 * Supabase client (service role key) is used here — never the anon client.
 */
export class SupabaseAttachmentStorage implements IAttachmentStorage {
	/**
	 * @description
	 * Fetches the UTF-8 text content of a file from Supabase Storage.
	 *
	 * @param url - The Supabase Storage URL for the file. The path segment
	 *   after `/storage/v1/object/public/room-attachments/` (or the signed
	 *   URL path) is extracted and used for the download call.
	 * @returns UTF-8 string content of the file, or empty string on failure.
	 */
	public async fetchTextContent(url: string): Promise<string> {
		try {
			const path = this.extractStoragePath(url);

			const { data, error } = await supabaseAdmin.storage
				.from("room-attachments")
				.download(path);

			if (error || !data) {
				console.warn(
					`[SupabaseAttachmentStorage] Failed to download "${path}":`,
					error?.message ?? "no data returned",
				);
				return "";
			}

			return await data.text();
		} catch (err) {
			console.warn(
				`[SupabaseAttachmentStorage] Unexpected error fetching "${url}":`,
				err,
			);
			return "";
		}
	}

	/**
	 * @description
	 * Extracts the storage object path from a full Supabase Storage URL.
	 *
	 * Supabase Storage URLs look like:
	 * `https://<project>.supabase.co/storage/v1/object/public/room-attachments/<path>`
	 *
	 * The `download()` API expects just `<path>` (relative to the bucket).
	 */
	private extractStoragePath(url: string): string {
		const marker = "/room-attachments/";
		const idx = url.indexOf(marker);
		if (idx === -1) {
			// Fallback: treat the whole URL as a path (graceful degradation).
			return url;
		}
		return url.slice(idx + marker.length);
	}
}
