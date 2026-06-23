import type { RoomDTO } from "@briom/app";
import {
	AccordionContent,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { formatDistanceToNow } from "date-fns";

import { RoomInformationHeader } from "./room-information-header";

interface RoomInformationDetails {
	room: RoomDTO;
}

export function RoomInformationDetails({ room }: RoomInformationDetails) {
	return (
		<AccordionItem className="border-b-0!" value="info">
			<RoomInformationHeader title="Room Info" />
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">ID</p>
						<p className="text-[11px] text-foreground/70 font-mono">
							#{room.id.slice(0, 8)}
						</p>
					</div>
					<div className="flex justify-between items-baseline">
						<p className="text-[11px] text-muted-foreground mb-0!">Formed At</p>
						<p className="text-[11px] text-foreground/70 font-mono">
							{formatDistanceToNow(new Date(room.createdAt))} ago
						</p>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
