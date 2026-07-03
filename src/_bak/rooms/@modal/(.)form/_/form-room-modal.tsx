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
import { useCallback, useState } from "react";

export function FormRoomModal() {
	const router = useRouter();
	const [open, setOpen] = useState(true);

	const closeModal = useCallback(() => {
		setOpen(false);
		setTimeout(() => router.back(), 200);
	}, [router]);

	const handleSuccess = useCallback(
		(roomId: string) => {
			setOpen(false);
			setTimeout(() => router.replace(`/rooms/${roomId}`), 200);
		},
		[router],
	);

	return (
		<Dialog
			onOpenChange={(isOpen) => (!isOpen ? closeModal() : undefined)}
			open={open}
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
				<div className="flex-1 flex flex-col overflow-hidden">
					<RoomForm onCancel={closeModal} onSuccess={handleSuccess} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
