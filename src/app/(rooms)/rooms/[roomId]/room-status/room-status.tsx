import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";

import { ROOM_STATUS_COLORS } from "@briom/rooms/mappings";

export function RoomStatus({ status }: { status: RoomDTO["status"] }) {
	const config = ROOM_STATUS_COLORS[status];

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider",
				config.class,
			)}
		>
			{config.label}
		</span>
	);
}
