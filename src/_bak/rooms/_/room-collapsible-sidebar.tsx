"use client";

import { Badge } from "@briom/components/ui/badge";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
} from "@briom/components/ui/sidebar";
import { useRooms } from "@briom/rooms/_/room/hooks/use-rooms";

interface RoomCollapsibleSidebarProps {
	children: React.ReactNode;
}

export function RoomCollapsibleSidebar({
	children,
}: RoomCollapsibleSidebarProps) {
	const { isMaxReached, rooms } = useRooms();
	return (
		<Sidebar className="hidden flex-1 md:flex" collapsible="none">
			<SidebarHeader className="h-14 border-b border-sidebar-border justify-center px-4">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-muted-foreground text-sm whitespace-nowrap">
						Rooms
					</h2>
					<Badge>{isMaxReached ? "Maxed" : rooms.length}</Badge>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="flex-1 px-0 py-0">
					<SidebarGroupContent className="flex-1">
						{children}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
