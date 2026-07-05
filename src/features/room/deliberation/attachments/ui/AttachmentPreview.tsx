"use client";

import { AnchorLink } from "@briom/components/ui/anchor-link";
import { XIcon } from "lucide-react";

import type { PendingAttachment } from "../utils/attachment.types";
import { formatSize, getFileIcon } from "../utils/attachment.utils";

interface AttachmentPreviewProps {
	/**
	 * @description
	 * Local attachment awaiting to be sent to turn registration.
	 * While pending, the actual file is uploaded to the storage.
	 *
	 * @see AttachmentStorage - for implementation details.
	 * `src/core/infrastructure/storage/attachments/attachment.storage.ts`
	 */
	attachments: PendingAttachment[];

	/**
	 * @description
	 * Whether the remove button can be clicked. Positive polarity to
	 * match `AttachmentButton`'s `canAdd` — both attachment controls are
	 * driven by the same "is a turn currently in flight" condition from
	 * `DeliberationEditor`, so keeping both props framed the same way
	 * (allow, not forbid) avoids the double-negative bugs that motivated
	 * this rename in the first place.
	 */
	canRemove?: boolean;

	/**
	 * @description
	 * Remove the attachment given the localId as props.
	 */
	onRemove: (localId: string) => void;
}

export function AttachmentPreview({
	attachments,
	canRemove = true,
	onRemove,
}: AttachmentPreviewProps) {
	return (
		<div className="flex flex-wrap gap-1.5 items-center">
			{attachments.map((a) => {
				const Icon = getFileIcon(a.mimeType);
				return (
					<div
						className="relative flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 border border-border/40 text-xs text-foreground/70 max-w-[200px]"
						key={a.localId}
					>
						<AnchorLink href={a.url} target="_blank" />
						<Icon className="size-3 shrink-0" />
						<span className="truncate min-w-0 font-mono">{a.name}</span>
						<span className="text-muted-foreground shrink-0">
							{formatSize(a.sizeBytes)}
						</span>
						<button
							aria-label={`Remove ${a.name}`}
							className="relative z-2 ml-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
							disabled={!canRemove}
							onClick={() => onRemove(a.localId)}
							type="button"
						>
							<XIcon className="size-3" />
						</button>
					</div>
				);
			})}
		</div>
	);
}
