import { SidebarInset } from "@briom/components/ui/sidebar";
import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { roomQueries } from "@briom/rooms/api/queries/room.queries";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getUser } from "../api/lib/faker";
import { roomShortcuts } from "../settings/room-shortcuts";

import {
	RoomCollapsibleSidebar,
	RoomComposer,
	RoomList,
	RoomListHeader,
	RoomListRenderer,
	RoomSidebar,
	RoomSidebarMenu,
	RoomStaticSidebar,
	SidebarHoverableLogoExpander,
	SidebarUserSettings,
} from "./room-composer";

export default async function RoomsLayout({
	children,
}: React.PropsWithChildren) {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(roomQueries.getRooms({}));
	void queryClient.prefetchQuery(roomQueries.getParticipantModels({}));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RoomComposer>
				<RoomSidebar>
					<RoomStaticSidebar
						footer={<SidebarUserSettings user={getUser()} />}
						header={
							<SidebarHoverableLogoExpander shortcuts={roomShortcuts.sidebar} />
						}
					>
						<RoomSidebarMenu />
					</RoomStaticSidebar>
					<RoomCollapsibleSidebar>
						<RoomListHeader />
						<RoomListRenderer>
							<RoomList />
						</RoomListRenderer>
					</RoomCollapsibleSidebar>
				</RoomSidebar>
				<SidebarInset className="overflow-hidden">{children}</SidebarInset>
			</RoomComposer>
		</HydrationBoundary>
	);
}
