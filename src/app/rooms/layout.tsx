import { SidebarInset, SidebarProvider } from "@briom/components/ui/sidebar";

import { getAvailableModels, getRooms } from "../api/rooms/actions";
import { RoomList } from "./_/room-list";
import { RoomSidebar } from "./_/room-sidebar";

export default async function RoomsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [models, rooms] = await Promise.all([getAvailableModels(), getRooms()]);

	if (models.error || rooms.error) {
		if (models.error) throw new Error(models.error.message);
		if (rooms.error) throw new Error(rooms.error.message);
	}

	return (
		<SidebarProvider
			style={{ "--sidebar-width": "350px" } as React.CSSProperties}
		>
			<RoomSidebar availableModels={models.data}>
				<RoomList rooms={rooms.data} />
			</RoomSidebar>
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
