"use client";

import { Badge } from "@briom/components/ui/badge";
import { SidebarHeader } from "@briom/components/ui/sidebar";

import { useRooms } from "@briom/rooms/hooks/store";

export function RoomListHeader() {
	const { rooms } = useRooms();

	return (
		<SidebarHeader className="h-14 border-b border-sidebar-border justify-center px-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-muted-foreground text-sm whitespace-nowrap">
					My Rooms
				</h2>
				<Badge>{rooms.length}</Badge>
			</div>
		</SidebarHeader>
	);
}
