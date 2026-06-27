"use client";

import { useRouter } from "@bprogress/next/app";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@briom/components/ui/dialog";
import { RoomForm } from "@briom/rooms/rooms/_/room-form/room-form";

export default function NewRoomModal() {
	const router = useRouter();

	return (
		<Dialog
			defaultOpen
			onOpenChange={(open) => {
				if (!open) router.back();
			}}
		>
			<DialogContent
				className="gap-0 sm:max-w-[calc(80%-2rem)] h-full max-h-[80%] flex flex-col p-0 overflow-hidden"
				showCloseButton={false}
			>
				<DialogHeader className="p-4">
					<DialogTitle>Form a Room</DialogTitle>
					<DialogDescription>
						Create a dedicated space for collaborative thinking. Invite
						perspectives, then guide the deliberation.
					</DialogDescription>
				</DialogHeader>
				<RoomForm className="mt-4" />
			</DialogContent>
		</Dialog>
	);
}
