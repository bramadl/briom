"use client";

import { Badge } from "@briom/components/ui/badge";

import { useRooms } from "../../queries/use-rooms";

export function SidebarRoomAvailability() {
	const { quotaLeft, total } = useRooms();
	return (
		<Badge>
			{total}/{quotaLeft}
		</Badge>
	);
}
