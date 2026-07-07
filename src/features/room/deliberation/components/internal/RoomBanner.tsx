"use client";

import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { AlertTriangleIcon, BanIcon } from "lucide-react";

export function RoomBanner() {
	const { isFrozen, room } = useRoom();

	return (
		<div
			className={cn(
				"sticky top-0 inset-x-0 px-4 py-2 text-sm flex items-center gap-2 animate-in slide-in-from-bottom fade-in-0",
				isFrozen
					? "bg-destructive/10 text-destructive border-b border-destructive/20"
					: "bg-amber-500/10 text-amber-600 border-b border-amber-500/20",
			)}
		>
			{room.state ? (
				<>
					<BanIcon className="size-3.5 shrink-0" />
					{room.state.reason}
				</>
			) : (
				<>
					<AlertTriangleIcon className="size-3.5 shrink-0" />
					{"Placeholder Message"}
				</>
			)}
		</div>
	);
}
