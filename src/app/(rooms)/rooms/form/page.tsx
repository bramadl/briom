import { getQueryClient } from "@briom/libs/tanstack/query/query-client";
import { prefetchModels } from "@briom/rooms/_/participant/queries/services/prefetch-models";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RoomFormPage } from "./_/room-form-page";

export const metadata = { title: "Form a Room – Briom" };

export default async function NewRoomPage() {
	const queryClient = getQueryClient();
	await prefetchModels(queryClient);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="h-dvh flex flex-col overflow-hidden">
				<div className="flex flex-col gap-1 shrink-0 p-4 sm:p-8">
					<h1 className="font-serif text-2xl">Form a Room</h1>
					<p className="text-sm text-muted-foreground">
						Create a dedicated space for collaborative thinking. Invite
						perspectives, then guide the deliberation.
					</p>
				</div>
				<div className="flex-1 flex flex-col px-2 sm:px-4 overflow-hidden">
					<RoomFormPage />
				</div>
			</main>
		</HydrationBoundary>
	);
}
