"use client";

import { Button } from "@briom/components/ui/button";
import { useRoomFormStore } from "@briom/rooms/_/room/store/use-room-form-store";
import { PlusIcon } from "lucide-react";

export function RoomFormDialogToggler() {
	const toggle = useRoomFormStore((s) => s.toggle);
	return (
		<Button onClick={toggle}>
			<PlusIcon />
			New room
		</Button>
	);
}
