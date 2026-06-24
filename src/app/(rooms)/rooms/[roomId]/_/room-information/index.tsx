"use client";

import { Accordion } from "@briom/components/ui/accordion";
import { Separator } from "@briom/components/ui/separator";
import { useRoom } from "@briom/rooms/_/room/queries/data/use-room";
import { useParams } from "next/navigation";

import { RoomDetails } from "./_/room-details";
import { RoomParticipants } from "./_/room-participants";
import { RoomTimeline } from "./_/room-timeline";
import { RoomTopic } from "./_/room-topic";

export function RoomInformation() {
	const { roomId } = useParams<{ roomId: string }>();
	const { multiDeliberation, room, turns } = useRoom(roomId);

	return (
		<Accordion
			className="sticky z-1 top-14 w-72 h-full shrink-0 self-start hidden lg:flex flex-col bg-background/80 backdrop-blur-sm border-l overflow-y-auto select-none"
			defaultValue={["topic", "participants", "timeline"]}
			type="multiple"
		>
			<RoomTopic topic={room.topic} />
			<RoomParticipants participants={room.participants} />
			<RoomTimeline
				multiDeliberation={multiDeliberation}
				participants={room.participants}
				turns={turns}
			/>
			<RoomDetails room={room} />
			<Separator />
		</Accordion>
	);
}
