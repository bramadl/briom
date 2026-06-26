import type { RoomOverviewDTO } from "@briom/app";
import { Separator } from "@briom/components/ui/separator";

import { RoomCreationDate } from "./_/room-creation-date";
import { RoomIdHash } from "./_/room-id-hash";
import { RoomParticipants } from "./_/room-participants/room-participants";

interface RoomDetailsProps {
	room: RoomOverviewDTO;
}

export function RoomDetails({ room }: RoomDetailsProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<h2 className="font-serif text-base font-bold line-clamp-1">
					{room.title}
				</h2>
			</div>
			<RoomParticipants participants={room.participants} />
			<Separator />
			<div className="flex items-center justify-between">
				<RoomIdHash id={room.id} />
				<RoomCreationDate formedAt={room.formedAt} />
			</div>
		</div>
	);
}
