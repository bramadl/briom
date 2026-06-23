import { SidebarTrigger } from "@briom/components/ui/sidebar";
import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { isServerError } from "@briom/libs/server-action";
import { getRoom } from "@briom/rooms/_/room/actions";
import { roomQueries } from "@briom/rooms/_/room/queries";
import { turnQueries } from "@briom/rooms/_/turn/queries/registry";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { RoomDeliberation } from "../../_bak/rooms/[roomId]/room-deliberation";
import { RoomInformation } from "../../_bak/rooms/[roomId]/room-information";
import { RoomPanel } from "../../_bak/rooms/[roomId]/room-panel";
import { RoomSettings } from "../../_bak/rooms/[roomId]/room-settings";
import { RoomTitle } from "../../_bak/rooms/[roomId]/room-title";

export default async function RoomPage({
	params,
}: PageProps<"/rooms/[roomId]">) {
	const { roomId } = await params;
	const result = await getRoom({ roomId });
	if (isServerError(result)) throw result.error;

	const { room } = result.data;
	if (!room) return notFound();

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(roomQueries.getRoom({ roomId }));
	void queryClient.prefetchQuery(turnQueries.getTurns({ roomId }));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="min-w-0 flex-1 flex flex-col overflow-hidden">
				<header className="sticky top-0 z-50 h-14 shrink-0 flex items-center justify-between gap-3 px-4 lg:px-6 border-b bg-background/80 backdrop-blur-sm">
					<div className="flex items-center gap-1">
						<SidebarTrigger className="md:hidden" />
						<RoomTitle />
					</div>
					<div className="flex items-center gap-1">
						<RoomSettings />
					</div>
				</header>
				<RoomPanel>
					<RoomDeliberation />
					<RoomInformation />
				</RoomPanel>
			</div>
		</HydrationBoundary>
	);
}
