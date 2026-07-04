"use client";

import { Badge } from "@briom/components/ui/badge";

import { useRooms } from "../../../hooks/use-rooms";

export function SidebarRoomAvailability() {
	const { quotaLeft, total } = useRooms();
	const maximum = quotaLeft + total;
	return (
		<Badge>
			{total}/{maximum}
		</Badge>
	);
}
