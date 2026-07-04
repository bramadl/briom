"use client";

import { Button } from "@briom/components/ui/button";
import { useIsMobile } from "@briom/hooks/use-mobile";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { useRooms } from "../../hooks/use-rooms";
import { useRoomFormHotkey } from "../hooks/use-room-form-hotkey";

export function RoomFormTrigger() {
	const { canOpenMoreRoom } = useRooms();
	const isMobile = useIsMobile();

	useRoomFormHotkey();

	const Component = isMobile ? "a" : Link;
	return (
		<Button asChild disabled={!canOpenMoreRoom}>
			<Component data-disable-progress={true} href="/rooms/form">
				<PlusIcon />
				New room
			</Component>
		</Button>
	);
}
