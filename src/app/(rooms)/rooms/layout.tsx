import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getModerator } from "../_/moderator/get-moderator";
import { ModeratorProvider } from "../_/moderator/moderator-provider";
import { prefetchModels } from "../_/participant/queries/services/prefetch-models";
import { prefetchRooms } from "../_/room/queries/services/prefetch-rooms";

import { ModeratorMenu } from "./_/moderator-menu/moderator-menu";
import { RoomCollapsibleSidebar } from "./_/room-collapsible-sidebar";
import { RoomForm } from "./_/room-form/room-form";
import { RoomFormDialog } from "./_/room-form-dialog/room-form-dialog";
import { RoomList } from "./_/room-list/room-list";
import { RoomSidebar } from "./_/room-sidebar/room-sidebar";
import { RoomWorkspace } from "./_/room-workspace";

export default async function RoomsLayout({
	children,
}: React.PropsWithChildren) {
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
				<RoomFormDialog>
					<RoomForm className="mt-4" />
				</RoomFormDialog>
			</ModeratorProvider>
		</HydrationBoundary>
	);
}
