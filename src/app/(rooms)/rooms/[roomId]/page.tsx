import { SidebarTrigger } from "@briom/components/ui/sidebar";
import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { prefetchRoom } from "@briom/rooms/_/room/queries/services/prefetch-room";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { RoomInformation } from "./_/room-information/room-information";
import { RoomInformationMobile } from "./_/room-information/room-information-mobile";
import { RoomOrchestration } from "./_/room-orchestration/room-orchestration";
import { RoomSettings } from "./_/room-settings/room-settings";
import { RoomTitle } from "./_/room-title";
import { SynthesisSheetProvider } from "./_/synthesis-sheet-provider/synthesis-sheet-provider";

export default async function RoomPage({
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
						<RoomTitle />
					</div>
					<RoomSettings />
				</header>
				<section className="flex flex-1 items-start min-w-0 overflow-hidden">
					<RoomOrchestration />
					<RoomInformation />
					<RoomInformationMobile />
				</section>
				<SynthesisSheetProvider />
			</div>
		</HydrationBoundary>
	);
}
