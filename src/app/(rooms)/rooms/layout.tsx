import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getModerator } from "../_/moderator/get-moderator";
import { ModeratorProvider } from "../_/moderator/moderator-provider";
import { prefetchModels } from "../_/participant/queries/services/prefetch-models";
import { prefetchRooms } from "../_/room/queries/services/prefetch-rooms";

import { ModeratorMenu } from "./_/moderator-menu/moderator-menu";
import { RoomCollapsibleSidebar } from "./_/room-collapsible-sidebar";
import { RoomFormHotkey } from "./_/room-form-hotkey";
import { RoomList } from "./_/room-list/room-list";
import { RoomSidebar } from "./_/room-sidebar/room-sidebar";
import { RoomWorkspace } from "./_/room-workspace";

export default async function RoomsLayout({
	children,
	modal,
}: React.PropsWithChildren<{ modal: React.ReactNode }>) {
	const moderator = await getModerator();

	const queryClient = getQueryClient();
	await Promise.all([prefetchRooms(queryClient), prefetchModels(queryClient)]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ModeratorProvider user={moderator}>
				<RoomWorkspace
					sidebar={
						<RoomSidebar menu={<ModeratorMenu user={moderator} />}>
							<RoomCollapsibleSidebar>
								<RoomList />
							</RoomCollapsibleSidebar>
						</RoomSidebar>
					}
				>
					{children}
				</RoomWorkspace>
				<RoomFormHotkey />
				{modal}
			</ModeratorProvider>
		</HydrationBoundary>
	);
}
