"use client";

import { useRouter } from "@bprogress/next/app";
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";
import { useRooms } from "@briom/rooms/_/room/hooks/use-rooms";
import { useHotkey } from "@tanstack/react-hotkeys";

export function RoomFormHotkey() {
	const { isMaxReached } = useRooms();
	const router = useRouter();

	useHotkey(
		ROOM_SETTING.SHORTCUTS.create.key,
		() => router.push("/rooms/form"),
		{ enabled: !isMaxReached },
	);

	return null;
}
