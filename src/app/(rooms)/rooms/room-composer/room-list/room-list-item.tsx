import type { RoomDTO } from "@briom/app";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";
import { Separator } from "@briom/components/ui/separator";
import { formatDate } from "date-fns";

import {
	RoomCard,
	RoomCardParticipantList,
	RoomCardStatusBadge,
} from "../room-card";

export interface RoomListItemProps {
	isActive?: boolean;
	room: RoomDTO;
}

export function RoomListItem({ isActive, room }: RoomListItemProps) {
	return (
		<HoverCard openDelay={1200}>
			<HoverCardTrigger asChild>
				<RoomCard isActive={isActive} room={room} />
			</HoverCardTrigger>
			<HoverCardContent align="start" className="w-96 space-y-4" side="right">
				<div className="flex items-center justify-between gap-2">
					<h2 className="font-serif text-base font-bold line-clamp-1">
						{room.title}
					</h2>
					<RoomCardStatusBadge status={room.status} />
				</div>
				<RoomCardParticipantList participants={room.participants} />
				<Separator />
				<div className="flex items-center justify-between">
					<p className="text-xs text-muted-foreground/50 font-mono">
						#{room.id.slice(0, 8)}
					</p>
					<p className="text-xs text-muted-foreground">
						Room formed at{" "}
						{formatDate(new Date(room.createdAt), "dd MMMM yyyy")}
					</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
