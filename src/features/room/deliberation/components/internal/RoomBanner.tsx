"use client";

import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { useMemo } from "react";

export function RoomBanner() {
	const { room } = useRoom();
	const roomState = useMemo(() => room.state, [room.state]);

	if (!roomState) return null;
	return (
		<div
			className={cn(
				"p-4 text-sm",
				roomState.kind === "frozen"
					? "bg-dusty-blue-background text-dusty-blue"
					: "bg-terracotta-background text-terracotta",
			)}
		>
			<p className="font-semibold">
				{roomState.kind === "frozen" ? "Room Frozen" : "Room Locked"}
			</p>
			<p className="text-xs">{roomState.reason}</p>
		</div>
	);
}
