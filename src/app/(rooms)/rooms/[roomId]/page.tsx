import { SidebarTrigger } from "@briom/components/ui/sidebar";
import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { isServerError } from "@briom/rooms/api/lib/server-action";
import { roomQueries } from "@briom/rooms/api/queries/room.queries";
import { turnQueries } from "@briom/rooms/api/queries/turn.queries";
import { getRoom } from "@briom/rooms/api/room.actions";
import { getTurns } from "@briom/rooms/api/turn.actions";
import { notFound } from "next/navigation";
import { Fragment } from "react/jsx-runtime";

import { RoomActions } from "./room-actions";
import { RoomDiscussion } from "./room-discussion";
import { RoomInformation } from "./room-information";
import { RoomSettings } from "./room-settings";
import { RoomTitle } from "./room-title";

export default async function RoomPage({
	params,
}: PageProps<"/rooms/[roomId]">) {
	const { roomId } = await params;

	const [roomResult, turnsResult] = await Promise.all([
		getRoom({ roomId }),
		getTurns({ roomId }),
	]);

	if (isServerError(roomResult)) {
		throw new Error(roomResult.error.message);
	} else if (isServerError(turnsResult)) {
		throw new Error(turnsResult.error.message);
	}

	const { room } = roomResult.data;
	if (!room) return notFound();

	const { turns } = turnsResult.data;

	const queryClient = getQueryClient();
	void queryClient.setQueryData(
		roomQueries.getRoom({ roomId }).queryKey,
		roomResult,
	);

	void queryClient.setQueryData(
		turnQueries.getTurns({ roomId }).queryKey,
		turnsResult,
	);

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			<header className="sticky top-0 z-50 h-14 shrink-0 flex items-center justify-between gap-3 px-4 lg:px-6 border-b bg-background/80 backdrop-blur-sm">
				<div className="flex items-center gap-1">
					<RoomTitle initialRoomTitle={room.title} />
					<SidebarTrigger className="md:hidden" />
				</div>
				<div className="flex items-center gap-1">
					<RoomActions room={room} />
					<RoomSettings room={room} />
				</div>
			</header>
			<div className="flex flex-1 items-start overflow-hidden">
				<RoomDiscussion room={room} turns={turns} />
				<RoomInformation room={room} turns={turns} />
			</div>
		</div>
	);
}
