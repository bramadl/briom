"use client";

import { useRouter } from "@bprogress/next/app";
import { RoomForm } from "@briom/app/_/room";

export default function RoomsFormPage() {
	const router = useRouter();
	return (
		<main className="h-dvh flex flex-col overflow-hidden">
			<div className="flex flex-col gap-1 shrink-0 p-4 sm:p-8">
				<h1 className="font-serif text-2xl">Form a Room</h1>
				<p className="text-sm text-muted-foreground">
					Create a dedicated space for collaborative thinking. Invite
					perspectives, then guide the deliberation.
				</p>
			</div>
			<div className="flex-1 flex flex-col overflow-hidden">
				<RoomForm
					onCanceled={() => router.push("/rooms")}
					onFormed={(id) => router.replace(`/rooms/${id}`)}
				/>
			</div>
		</main>
	);
}
