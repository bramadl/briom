import { getUser } from "@briom/libs/faker";
import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchModels } from "../_/participant/queries/services/prefetch-models";
import { prefetchRooms } from "../_/room/queries/services/prefetch-rooms";

import { ModeratorMenu } from "./_/moderator-menu";
import { RoomCollapsibleSidebar } from "./_/room-collapsible-sidebar";
import { RoomFormProvider } from "./_/room-form-provider";
import { RoomList } from "./_/room-list";
import { RoomSidebar } from "./_/room-sidebar";
import { RoomWorkspace } from "./_/room-workspace";

const user = getUser();

export default async function RoomsLayout({
	children,
}: React.PropsWithChildren) {
	const queryClient = getQueryClient();
	await Promise.all([prefetchRooms(queryClient), prefetchModels(queryClient)]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RoomWorkspace
				sidebar={
					<RoomSidebar menu={<ModeratorMenu user={user} />}>
						<RoomCollapsibleSidebar>
							<RoomList />
						</RoomCollapsibleSidebar>
					</RoomSidebar>
				}
			>
				{children}
			</RoomWorkspace>
			<RoomFormProvider />
		</HydrationBoundary>
	);
}
