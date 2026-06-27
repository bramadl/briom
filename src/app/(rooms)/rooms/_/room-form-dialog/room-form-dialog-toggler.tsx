"use client";

import { Button } from "@briom/components/ui/button";
import { useRooms } from "@briom/rooms/_/room/hooks/use-rooms";
import { useRoomFormStore } from "@briom/rooms/_/room/store/use-room-form.store";
import { PlusIcon } from "lucide-react";

export function RoomFormDialogToggler() {
	const { isMaxReached } = useRooms();
	const toggle = useRoomFormStore((s) => s.toggle);
	return (
		<Button disabled={isMaxReached} onClick={toggle}>
			<PlusIcon />
			New room
		</Button>
	);
}
