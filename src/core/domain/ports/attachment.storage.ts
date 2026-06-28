/**
 * @description
 * Port for fetching raw text content from a file storage provider.
 *
 * `TranscriptorRenderer` depends on this abstraction — not on Supabase
 * directly — keeping the domain free of infrastructure imports.
 *
 * Implementations (e.g. `SupabaseAttachmentStorage`) live in
 * `src/libs/providers/supabase/`.
 */
export interface IAttachmentStorage {
	/**
	 * @description
	 * Fetches the UTF-8 text content of a file by its storage URL.
	 * Throws (or returns an empty string) on network/permission error —
	 * callers should treat fetch failures as non-fatal and skip the attachment.
	 */
	fetchTextContent(url: string): Promise<string>;
}
