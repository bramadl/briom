"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@briom/components/ui/dialog";
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";
import { useRoomFormStore } from "@briom/rooms/_/room/store/use-room-form.store";
import { useHotkey } from "@tanstack/react-hotkeys";

interface RoomFormDialogProps extends React.PropsWithChildren {}

export function RoomFormDialog({ children }: RoomFormDialogProps) {
	const shown = useRoomFormStore((state) => state.shown);
	const setShown = useRoomFormStore((state) => state.setShown);

	const toggle = useRoomFormStore((state) => state.toggle);
	useHotkey(ROOM_SETTING.SHORTCUTS.create.key, toggle);

	return (
		<Dialog onOpenChange={setShown} open={shown}>
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
				{children}
			</DialogContent>
		</Dialog>
	);
}
