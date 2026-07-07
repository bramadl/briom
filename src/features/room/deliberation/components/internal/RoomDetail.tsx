import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { Separator } from "@briom/components/ui/separator";
import { cn } from "@briom/libs/utils";
import { useModerator } from "@briom/moderator/hooks/use-moderator";
import {
	formatSize,
	getFileIcon,
} from "@briom/room/deliberation/attachments/utils/attachment.utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { ROOM_THEME } from "@briom/room/settings/theme";
import { formatDistanceToNow } from "date-fns";
import { PaperclipIcon } from "lucide-react";
import { useMemo } from "react";

function RoomAttachmentRow({
	mimeType,
	name,
	sizeBytes,
	url,
}: {
	mimeType: string;
	name: string;
	sizeBytes: number;
	url: string;
}) {
	const Icon = getFileIcon(mimeType);

	return (
		<a
			className="group flex items-center gap-2 px-2 py-1.5 rounded-md border border-border/30 bg-background/50 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
			href={url}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Icon className="size-3.5 shrink-0" />
			<span className="truncate font-mono flex-1">{name}</span>
			<span className="shrink-0 opacity-60 font-mono">
				{formatSize(sizeBytes)}
			</span>
		</a>
	);
}

export function RoomDetail() {
	const { canAttachFile, room } = useRoom();
	const {
		limit: { maximumAttachmentPerRoom },
	} = useModerator();

	const shortId = useMemo(
		() => room.info.metadata.shortId,
		[room.info.metadata.shortId],
	);

	const formedAt = useMemo(
		() => formatDistanceToNow(new Date(room.info.metadata.formedAt)),
		[room.info.metadata.formedAt],
	);

	const status = useMemo(
		() => room.info.metadata.status,
		[room.info.metadata.status],
	);

	const theme = useMemo(() => ROOM_THEME.status[status], [status]);

	const attachments = useMemo(
		() => room.info.attachments,
		[room.info.attachments],
	);

	const attachmentsCount = attachments.length;

	const cannotAttachBecauseMaximumReached =
		!canAttachFile && attachmentsCount >= maximumAttachmentPerRoom;

	return (
		<AccordionItem className="border-b-0!" value="info">
			<AccordionExpander title="Room Info" />
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-2">
						<div className="flex justify-between items-baseline">
							<p className="text-[11px] text-muted-foreground mb-0! flex items-center gap-1.5">
								<PaperclipIcon className="size-3" />
								Attachments
							</p>
							<p className="text-[11px] text-foreground/70 font-mono">
								{attachmentsCount}/{maximumAttachmentPerRoom}
							</p>
						</div>

						{attachmentsCount > 0 ? (
							<div className="flex flex-col gap-1.5">
								{attachments.map((attachment) => (
									<RoomAttachmentRow key={attachment.url} {...attachment} />
								))}
							</div>
						) : (
							<p className="text-[11px] text-muted-foreground/60 italic">
								No files attached yet.
							</p>
						)}

						{cannotAttachBecauseMaximumReached && (
							<p className="text-[11px] text-terracotta bg-terracotta/10 rounded-md px-2 py-1.5 leading-relaxed">
								Attachment limit reached ({maximumAttachmentPerRoom} max).
							</p>
						)}
					</div>

					<Separator />

					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">Room ID</p>
						<p className="text-[11px] text-foreground/70 font-mono">
							{shortId}
						</p>
					</div>

					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">
							Room Status
						</p>
						<p
							className={cn(
								"text-[11px] text-foreground/70 font-mono uppercase px-1",
								theme.class,
							)}
						>
							{status}
						</p>
					</div>

					<Separator />

					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">Formed At</p>
						<p className="text-[11px] text-foreground/70 font-mono">
							{formedAt} ago
						</p>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
