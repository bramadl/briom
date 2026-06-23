import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";
import { ROOM_THEME } from "@briom/rooms/_/room/config/theme";

export function RoomStatus({ status }: { status: RoomDTO["status"] }) {
	const theme = ROOM_THEME.status[status];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
				theme.class,
			)}
		>
			{theme.label}
		</span>
	);
}
