import type { RoomDTO } from "@briom/app";
import { AnchorLink } from "@briom/components/ui/anchor-link";
import { Separator } from "@briom/components/ui/separator";
import { cn } from "@briom/libs/utils";

import { RoomParticipants } from "./_/room-participants";
import { RoomTopic } from "./_/room-topic";

export interface RoomInformationProps {
	isActive?: boolean;
	room: RoomDTO;
}

export function RoomInformation({
	isActive,
	room,
	...props
}: RoomInformationProps) {
	return (
		<div
			className={cn(
				"group relative flex flex-col gap-3 border-b last:border-0 p-4 text-sm leading-tight transition-colors",
				isActive ? "bg-muted/50" : "hover:bg-muted/25",
			)}
			{...props}
		>
			<AnchorLink
				href={`/rooms/${room.id}`}
				label={`Open ${room.title} room`}
			/>

			<h2 className="font-bold font-serif text-base line-clamp-1">
				{room.title}
			</h2>
			<Separator />
			<RoomTopic topic={room.topic} />
			<Separator />
			<RoomParticipants participants={room.participants} />
		</div>
	);
}
