"use client";

import { Button } from "@briom/components/ui/button";
import { Plus } from "lucide-react";
import { useRoom } from "../use-room";

export function RoomFormTrigger() {
	const { openRoomFormDialog } = useRoom();

	return (
		<Button onClick={openRoomFormDialog}>
			<Plus />
			New room
		</Button>
	);
}
