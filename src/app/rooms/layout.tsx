import { SIDEBAR_COOKIE_NAME } from "@briom/components/ui/sidebar.constants";
import { getQueryClient } from "@briom/libs/providers/tanstack/query/query-client";
import { prefetchRooms } from "@briom/room/actions/prefetch/prefetch-rooms";
import { RoomSidebar } from "@briom/room/sidebar/ui/RoomSidebar";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";

export default async function RoomsLayout({
	children,
	modal,
}: React.PropsWithChildren<{ modal: React.ReactNode }>) {
	const queryClient = getQueryClient();
	await prefetchRooms(queryClient);

	const cookieStore = await cookies();
	const cookieSidebar = cookieStore.get(SIDEBAR_COOKIE_NAME);

	const sidebarState = cookieSidebar?.value !== "false" ? "opened" : "closed";
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{modal}
			<RoomSidebar defaultState={sidebarState} mainPage={children} />
		</HydrationBoundary>
	);
}
