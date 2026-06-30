/**
 * @description
 * Port for fetching raw text content from a file storage provider.
 */
export interface IAttachmentStorage {
	/**
	 * @description
	 * Permanently deletes all file attachments nested inside a specific
	 * room folder. Called during the room closure/deletion flow by
	 * `DeleteRoomHandler` to prevent orphaned files in storage.
	 */
	deleteRoomFolder(roomId: string): Promise<void>;

	/**
	 * @description
	 * Fetches the UTF-8 text content of a file by its storage URL.
	 * Throws (or returns an empty string) on network/permission error —
	 * callers should treat fetch failures as non-fatal and skip the attachment.
	 */
	fetchTextContent(url: string): Promise<string>;
}
