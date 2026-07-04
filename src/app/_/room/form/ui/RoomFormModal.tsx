"use client";

import { useRouter } from "@bprogress/next/app";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@briom/components/ui/dialog";
import { useCallback, useState } from "react";

import { RoomForm } from "./RoomForm";

export function RoomFormModal() {
	const router = useRouter();
	const [open, setOpen] = useState(true);

	const closeModal = useCallback(() => {
		setOpen(false);
		router.back({ showProgress: false });
	}, [router]);

	const redirectToRoom = useCallback(
		(roomId: string) => {
			setOpen(false);
			router.replace(`/rooms/${roomId}`);
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
					<RoomForm
						onCanceled={closeModal}
						onFormed={redirectToRoom}
						padded={false}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
