import { RoomFormHotkey } from "@briom/(room)";
import { getQueryClient } from "@briom/libs/providers/tanstack/query/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function RoomsIdPage({
	params: _,
}: PageProps<"/rooms/[roomId]">) {
	const queryClient = getQueryClient();

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div>Room Page</div>
			<RoomFormHotkey />
		</HydrationBoundary>
	);
}
