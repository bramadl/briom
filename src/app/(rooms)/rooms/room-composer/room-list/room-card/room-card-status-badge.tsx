import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";

export function RoomCardStatusBadge({ status }: { status: RoomDTO["status"] }) {
	const config = {
		concluded: {
			class: "bg-muted text-muted-foreground",
			label: "Concluded",
		},
		deliberating: {
			class: "bg-emerald-500/10 text-emerald-600",
			label: "Deliberating",
		},
		forming: {
			class: "bg-amber-500/10 text-amber-600",
			label: "Forming",
		},
		paused: {
			class: "bg-sky-500/10 text-sky-600",
			label: "Paused",
		},
	}[status];

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
