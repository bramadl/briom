import type { RoomDTO } from "@briom/app";
import { Separator } from "@briom/components/ui/separator";
import { cn } from "@briom/libs/utils";
import Link from "next/link";

import { RoomCardParticipantBubbles } from "./room-card-participant-bubbles";

export interface RoomCardProps {
	isActive?: boolean;
	room: RoomDTO;
}

export function RoomCard({
	isActive,
	room: { id, participants, title, topic },
	...props
}: RoomCardProps) {
	const hasTopic = topic && topic.trim().length > 0;

	return (
		<div
			className={cn(
				"group relative flex flex-col gap-3 border-b last:border-0 p-4 text-sm leading-tight transition-colors",
				isActive ? "bg-muted/50" : "hover:bg-muted/25",
			)}
			{...props}
		>
			<Link
				aria-label={`Open ${title} room`}
				className="absolute inset-0"
				href={`/rooms/${id}`}
			/>

			<div className="flex items-center justify-between gap-2">
				<h2 className="font-serif text-base font-bold line-clamp-1">{title}</h2>
			</div>

			<Separator />

			<div className="flex flex-col gap-1">
				<span className="font-medium font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
					{hasTopic ? "Topic" : "No topic yet"}
				</span>
				<span
					className={cn(
						"line-clamp-2 text-xs leading-relaxed",
						hasTopic
							? "text-muted-foreground"
							: "text-muted-foreground/40 italic",
					)}
				>
					{hasTopic
						? topic
						: "Bring a question or idea to start the deliberation."}
				</span>
			</div>

			<Separator />

			<div className="flex items-center justify-between">
				<RoomCardParticipantBubbles participants={participants} />
				<span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
					{participants.length > 0
						? `${participants.length} participant${participants.length > 1 ? "s" : ""}`
						: "Awaiting invite"}
				</span>
			</div>
		</div>
	);
}
