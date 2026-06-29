"use client";

import { AnchorLink } from "@briom/components/ui/anchor-link";
import { FileCodeIcon, FileIcon, ImageIcon, XIcon } from "lucide-react";
import type { PendingAttachment } from "./use-attachment";

interface AttachmentPreviewProps {
	attachments: PendingAttachment[];
	onRemove: (localId: string) => void;
}

function getFileIcon(mimeType: string) {
	if (mimeType.startsWith("image/")) {
		return <ImageIcon className="size-3 shrink-0" />;
	} else if (
		mimeType.startsWith("text/x-") ||
		mimeType === "application/json" ||
		mimeType === "application/x-yaml"
	) {
		return <FileCodeIcon className="size-3 shrink-0" />;
	} else {
		return <FileIcon className="size-3 shrink-0" />;
	}
}

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	return `${Math.round(bytes / 1024)} KB`;
}

export function AttachmentPreview({
	attachments,
	onRemove,
}: AttachmentPreviewProps) {
	return (
		<div className="flex flex-wrap gap-1.5 items-center">
			{attachments.map((a) => (
				<div
					className="relative flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 border border-border/40 text-xs text-foreground/70 max-w-[200px]"
					key={a.localId}
				>
					<AnchorLink href={a.url} target="_blank" />
					{getFileIcon(a.mimeType)}
					<span className="truncate min-w-0 font-mono">{a.name}</span>
					<span className="text-muted-foreground shrink-0">
						{formatSize(a.sizeBytes)}
					</span>
					<button
						aria-label={`Remove ${a.name}`}
						className="relative z-2 ml-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
						onClick={() => onRemove(a.localId)}
						type="button"
					>
						<XIcon className="size-3" />
					</button>
				</div>
			))}
		</div>
	);
}
