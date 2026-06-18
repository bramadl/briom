import { Badge } from "@briom/components/ui/badge";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
} from "@briom/components/ui/sidebar";
import type { RoomSummaryDTO } from "@briom/core/application/_bak";

import { RoomListItem } from "./room-list-item";

interface RoomListProps {
	rooms: RoomSummaryDTO[];
}

export function RoomList({ rooms }: RoomListProps) {
	return (
		<Sidebar className="hidden flex-1 md:flex" collapsible="none">
			<SidebarHeader className="h-14 border-b border-sidebar-border justify-center px-4">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-muted-foreground text-sm whitespace-nowrap">
						My Rooms
					</h2>
					<Badge>{rooms.length}</Badge>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="px-0 py-0">
					<SidebarGroupContent>
						{rooms.map((room) => (
							<RoomListItem key={room.id} room={room} />
						))}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
