import { SidebarTrigger } from "@briom/components/ui/sidebar";
import { getQueryClient } from "@briom/libs/providers/tanstack/query/query-client";
import { RoomEditableTitle } from "@briom/room/deliberation/ui/RoomEditableTitle";
import { RoomFormHotkey } from "@briom/room/form/ui/RoomFormHotkey";
import { prefetchRoom } from "@briom/room/queries/prefetch-room";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function RoomsIdPage({
	params,
}: PageProps<"/rooms/[roomId]">) {
	const { roomId } = await params;

	const queryClient = getQueryClient();
	await prefetchRoom(queryClient, roomId);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="min-w-0 flex-1 flex flex-col overflow-hidden">
				<header className="sticky top-0 z-50 h-14 shrink-0 flex items-center justify-between gap-3 px-4 lg:px-6 border-b bg-background/80 backdrop-blur-sm">
					<div className="flex items-center gap-1">
						<SidebarTrigger className="md:hidden" />
						<RoomEditableTitle />
					</div>
					<div>Room Settings</div>
				</header>
				<section className="flex flex-1 items-start min-w-0 overflow-hidden">
					<div>Room Deliberation</div>
					<div>Room Information</div>
				</section>
			</div>
			<RoomFormHotkey />
		</HydrationBoundary>
	);
}
