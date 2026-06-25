"use client";

import { Accordion } from "@briom/components/ui/accordion";
import { Separator } from "@briom/components/ui/separator";
import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useSynthesisSheetStore } from "@briom/rooms/_/room/store/use-synthesis-sheet.store";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { RoomDetails } from "./_/room-details";
import { RoomParticipants } from "./_/room-participants";
import { RoomSynthesis } from "./_/room-synthesis";
import { RoomTimeline } from "./_/room-timeline";
import { RoomTopic } from "./_/room-topic";

export function RoomInformation() {
	const { roomId } = useParams<{ roomId: string }>();
	const { multiDeliberation, room, turns } = useRoom(roomId);
	const openSheet = useSynthesisSheetStore((s) => s.open);

	const defaultAccordionValues = useMemo(() => {
		const base = ["topic", "participants", "timeline"];
		if (room.synthesis || room.synthesisStatus !== "idle") {
			return [...base, "synthesis"];
		}
		return base;
	}, [room.synthesis, room.synthesisStatus]);

	return (
		<Accordion
			className="sticky z-1 top-14 w-72 h-full shrink-0 self-start hidden lg:flex flex-col bg-background/80 backdrop-blur-sm border-l overflow-y-auto select-none"
			defaultValue={defaultAccordionValues}
			type="multiple"
		>
			<RoomSynthesis
				onOpenSheet={openSheet}
				synthesis={room.synthesis}
				synthesisCreatedAt={room.synthesis?.createdAt ?? null}
				synthesisCreatedBy={room.synthesis?.createdBy ?? null}
				synthesisStatus={room.synthesisStatus}
			/>
			<RoomTopic topic={room.topic} />
			<RoomParticipants participants={room.participants} />
			<RoomTimeline multiDeliberation={multiDeliberation} turns={turns} />
			<RoomDetails room={room} />
			<Separator />
		</Accordion>
	);
}
