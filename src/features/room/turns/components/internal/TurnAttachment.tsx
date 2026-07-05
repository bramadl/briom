import {
	formatSize,
	getFileIcon,
} from "@briom/room/deliberation/attachments/utils/attachment.utils";

export interface TurnAttachmentProps {
	/**
	 * @description
	 * The original Mime-type uploaded (as-is).
	 * Rendering different icons based on this value.
	 */
	mimeType: string;

	/**
	 * @description
	 * Name of the "uploaded" file.
	 *
	 * This is different with the original name, since
	 * the file is being "fetched" again by the server.
	 */
	name: string;

	/**
	 * @description
	 * Size of the file in bytes.
	 */
	sizeBytes: number;

	/**
	 * @description
	 * The URL of this attachment.
	 * Typically a Public URL just to mention.
	 */
	url: string;
}

export function TurnAttachment({
	mimeType,
	name,
	sizeBytes,
	url,
}: TurnAttachmentProps) {
	const Icon = getFileIcon(mimeType);
	return (
		<a
			className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border/30 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors max-w-[180px]"
			href={url}
			key={url}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Icon className="size-4" />
			<span className="truncate font-mono">{name}</span>
			<span className="shrink-0 opacity-60">{formatSize(sizeBytes)}</span>
		</a>
	);
}
