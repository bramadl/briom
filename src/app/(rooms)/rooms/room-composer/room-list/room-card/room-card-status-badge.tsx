import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";
import { ROOM_STATUS_COLORS } from "@briom/rooms/mappings/room-status-colors.map";

export function RoomCardStatusBadge({ status }: { status: RoomDTO["status"] }) {
	const config = ROOM_STATUS_COLORS[status];

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
				config.class,
			)}
		>
			{config.label}
		</span>
	);
}
