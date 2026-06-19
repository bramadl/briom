import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { isServerError } from "@briom/rooms/api/lib/server-action";
import { roomQueries } from "@briom/rooms/api/queries/room.queries";
import { getParticipantModels, getRooms } from "@briom/rooms/api/room.actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
	RoomCollapsibleSidebar,
	RoomComposer,
	RoomList,
	RoomListHeader,
	RoomListRenderer,
	RoomPanel,
	RoomSidebar,
	RoomSidebarMenu,
	RoomStaticSidebar,
	SidebarHoverableLogoExpander,
	SidebarUserSettings,
} from "./room-composer";
import { roomShortcuts } from "./room-composer/room-shortcuts";

const user = {
	name: "Bram Adl",
	email: "bram.adl@briom.com",
};

export default async function RoomsLayout({
	children,
}: React.PropsWithChildren) {
	const [roomsResult, modelsResult] = await Promise.all([
		getRooms({}),
		getParticipantModels({}),
	]);

	const queryClient = getQueryClient();
	void queryClient.setQueryData(roomQueries.getRooms({}).queryKey, roomsResult);
	void queryClient.setQueryData(
		roomQueries.getParticipantModels({}).queryKey,
		modelsResult,
	);

	const rooms = isServerError(roomsResult) ? [] : roomsResult.data.rooms;
	const roomCount = rooms.length;

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RoomComposer>
				<RoomSidebar>
					<RoomStaticSidebar
						footer={<SidebarUserSettings user={user} />}
						header={
							<SidebarHoverableLogoExpander shortcuts={roomShortcuts.sidebar} />
						}
					>
						<RoomSidebarMenu />
					</RoomStaticSidebar>
					<RoomCollapsibleSidebar>
						<RoomListHeader roomCount={roomCount} />
						<RoomListRenderer>
							<RoomList rooms={rooms} />
						</RoomListRenderer>
					</RoomCollapsibleSidebar>
				</RoomSidebar>
				<RoomPanel>{children}</RoomPanel>
			</RoomComposer>
		</HydrationBoundary>
	);
}
