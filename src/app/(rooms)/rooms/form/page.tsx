import { getQueryClient } from "@briom/libs/next/tanstack/query/query-client";
import { prefetchModels } from "@briom/rooms/_/participant/queries/services/prefetch-models";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { RoomForm } from "../_/room-form/room-form";

export const metadata = { title: "Form a Room – Briom" };

export default async function NewRoomPage() {
	const queryClient = getQueryClient();
	await prefetchModels(queryClient);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="min-h-dvh flex flex-col">
				<div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-4 py-8 gap-6">
					<div className="flex flex-col gap-1">
						<h1 className="font-serif text-2xl">Form a Room</h1>
						<p className="text-sm text-muted-foreground">
							Create a dedicated space for collaborative thinking. Invite
							perspectives, then guide the deliberation.
						</p>
					</div>
					<RoomForm className="flex-1" />
				</div>
			</main>
		</HydrationBoundary>
	);
}
