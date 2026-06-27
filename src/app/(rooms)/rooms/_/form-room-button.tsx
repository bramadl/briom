"use client";

import { Button } from "@briom/components/ui/button";
import { useIsMobile } from "@briom/hooks/use-mobile";
import { useRooms } from "@briom/rooms/_/room/hooks/use-rooms";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export function FormRoomButton() {
	const { isMaxReached } = useRooms();
	const isMobile = useIsMobile();

	return (
		<Button asChild disabled={isMaxReached}>
			{isMobile ? (
				<a href="/rooms/form">
					<PlusIcon />
					New room
				</a>
			) : (
				<Link href="/rooms/form">
					<PlusIcon />
					New room
				</Link>
			)}
		</Button>
	);
}
