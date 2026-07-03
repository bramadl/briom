"use client";

import { Accordion } from "@briom/components/ui/accordion";
import { Button } from "@briom/components/ui/button";
import { Separator } from "@briom/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@briom/components/ui/sheet";
import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useSynthesisSheetStore } from "@briom/rooms/_/room/store/use-synthesis-sheet.store";
import { PanelRightIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Fragment, useState } from "react";

import { RoomDetails } from "./_/room-details";
import { RoomParticipants } from "./_/room-participants/room-participants";
import { RoomSynthesis } from "./_/room-synthesis";
import { RoomTimeline } from "./_/room-timeline/room-timeline";
import { RoomTopic } from "./_/room-topic";

export function RoomInformationMobile() {
	const { roomId } = useParams<{ roomId: string }>();
	const { multiDeliberation, room, turns } = useRoom(roomId);

	const openSheet = useSynthesisSheetStore((s) => s.open);
	const [open, setOpen] = useState(false);

	return (
		<Fragment>
			<Button
				className="fixed right-4 top-20 z-40 lg:hidden size-10 rounded-full shadow-lg border border-border/50 bg-background/80 backdrop-blur-sm"
				onClick={() => setOpen(true)}
				size="icon"
				variant="ghost"
			>
				<PanelRightIcon className="size-4" />
			</Button>

			<Sheet onOpenChange={setOpen} open={open}>
				<SheetContent
					className="w-80 p-0 border-l border-border/50"
					side="right"
				>
					<SheetHeader className="sr-only">
						<SheetTitle>Room Information</SheetTitle>
						<SheetDescription>Room details and timeline</SheetDescription>
					</SheetHeader>
					<div className="flex flex-col h-full overflow-y-auto bg-background/80 backdrop-blur-sm">
						<Accordion
							defaultValue={["topic", "participants", "timeline"]}
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
							<RoomTimeline
								multiDeliberation={multiDeliberation}
								turns={turns}
							/>
							<RoomDetails room={room} />
							<Separator />
						</Accordion>
					</div>
				</SheetContent>
			</Sheet>
		</Fragment>
	);
}
