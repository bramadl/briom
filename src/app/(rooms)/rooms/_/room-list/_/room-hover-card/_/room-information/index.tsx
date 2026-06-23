import type { RoomDTO } from "@briom/app";
import { AnchorLink } from "@briom/components/ui/anchor-link";
import { Separator } from "@briom/components/ui/separator";
import { cn } from "@briom/libs/utils";

import { RoomParticipants } from "./_/room-participants";
import { RoomTitle } from "./_/room-title";
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

			<RoomTitle roomTitle={room.title} />
			<Separator />
			<RoomTopic topic={room.topic} />
			<Separator />
			<RoomParticipants participants={room.participants} />
		</div>
	);
}
