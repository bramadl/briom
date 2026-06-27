"use client";

import { Button } from "@briom/components/ui/button";
import { useRooms } from "@briom/rooms/_/room/hooks/use-rooms";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export function RoomFormDialogToggler() {
	const { isMaxReached } = useRooms();

	return (
		<Button asChild disabled={isMaxReached}>
			<Link href="/rooms/form">
				<PlusIcon />
				New room
			</Link>
		</Button>
	);
}
