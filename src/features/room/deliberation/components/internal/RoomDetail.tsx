import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { ROOM_THEME } from "@briom/room/settings/theme";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";

export function RoomDetail() {
	const { room } = useRoom();

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

	return (
		<AccordionItem className="border-b-0!" value="info">
			<AccordionExpander title="Room Info" />
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
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
