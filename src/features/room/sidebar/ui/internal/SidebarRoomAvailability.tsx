"use client";

import { Badge } from "@briom/components/ui/badge";
import { useRooms } from "@briom/room/hooks/use-rooms";

export function SidebarRoomAvailability() {
	const { quotaLeft, total } = useRooms();
	const maximum = quotaLeft + total;
	return (
		<Badge>
			{total}/{maximum}
		</Badge>
	);
}
