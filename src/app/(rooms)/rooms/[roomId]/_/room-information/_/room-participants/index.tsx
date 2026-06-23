import type { RoomDTO } from "@briom/app";
import {
	AccordionContent,
	AccordionExpander,
	AccordionItem,
} from "@briom/components/ui/accordion";
import { Badge } from "@briom/components/ui/badge";
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";
import { ParticipantInfo } from "./_/participant-info";

interface RoomParticipantsProps {
	participants: RoomDTO["participants"];
}

export function RoomParticipants({ participants }: RoomParticipantsProps) {
	return (
		<AccordionItem value="participants">
			<AccordionExpander title={`Participants (${participants.length})`}>
				{participants.length === ROOM_SETTING.MAXIMUM_PARTICIPANT && (
					<Badge className="text-[10px]" variant={"outline"}>
						Max
					</Badge>
				)}
			</AccordionExpander>
			<AccordionContent className="border-t p-4">
				<div className="flex flex-col gap-3">
					{participants.map((p) => (
						<ParticipantInfo key={p.id} participant={p} />
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
