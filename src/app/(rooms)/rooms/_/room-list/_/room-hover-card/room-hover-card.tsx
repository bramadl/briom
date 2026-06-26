import type { RoomOverviewDTO } from "@briom/app";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@briom/components/ui/hover-card";

import { RoomDetails } from "./_/room-details/room-details";
import { RoomInformation } from "./_/room-information/room-information";

export interface RoomHoverCardProps {
	isActive?: boolean;
	room: RoomOverviewDTO;
}

export function RoomHoverCard({ isActive, room }: RoomHoverCardProps) {
	return (
		<HoverCard openDelay={1200}>
			<HoverCardTrigger asChild>
				<RoomInformation isActive={isActive} room={room} />
			</HoverCardTrigger>
			<HoverCardContent align="start" className="w-96" side="right">
				<RoomDetails room={room} />
			</HoverCardContent>
		</HoverCard>
	);
}
