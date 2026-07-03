import type { RoomDeliberationDTO } from "@briom/app/bak";
import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { cn } from "@briom/libs/utils";
import { ROOM_THEME } from "@briom/rooms/_/room/config/theme";
import { formatDistanceToNow } from "date-fns";

interface RoomDetails {
	room: RoomDeliberationDTO;
}

export function RoomDetails({ room }: RoomDetails) {
	const hashId = `#${room.id.slice(0, 8)}`;
	const created = formatDistanceToNow(new Date(room.info.formedAt));
	const theme = ROOM_THEME.status[room.status];

	return (
		<AccordionItem className="border-b-0!" value="info">
			<AccordionExpander title="Room Info" />
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">Room ID</p>
						<p className="text-[11px] text-foreground/70 font-mono">{hashId}</p>
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
							{room.status}
						</p>
					</div>
					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">Formed At</p>
						<p className="text-[11px] text-foreground/70 font-mono">
							{created} ago
						</p>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
