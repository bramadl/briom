import { SidebarInset, SidebarProvider } from "@briom/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@briom/components/ui/sidebar.constants";
import { cookies } from "next/headers";

import { getAvailableModels, getRooms } from "../api/rooms/actions";
import { RoomList } from "./_/room-list";
import { RoomProvider } from "./_/room-provider";
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

	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

	return (
		<SidebarProvider
			defaultOpen={sidebarOpen}
			style={{ "--sidebar-width": "350px" } as React.CSSProperties}
		>
			<RoomProvider availableModels={models.data}>
				<RoomSidebar>
					<RoomList rooms={rooms.data} />
				</RoomSidebar>
				<SidebarInset>{children}</SidebarInset>
			</RoomProvider>
		</SidebarProvider>
	);
}
