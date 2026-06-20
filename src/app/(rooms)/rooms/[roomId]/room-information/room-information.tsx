import type { RoomDTO, TurnDTO } from "@briom/app";
import { Accordion } from "@briom/components/ui/accordion";
import { Separator } from "@briom/components/ui/separator";

import { RoomInformationDetails } from "./room-information-details";
import { RoomInformationMiniTimeline } from "./room-information-mini-timeline";
import { RoomInformationParticipantList } from "./room-information-participant-list";
import { RoomInformationTopic } from "./room-information-topic";

interface RoomInformationProps {
	room: RoomDTO;
	turns: TurnDTO[];
}

export function RoomInformation({ room, turns }: RoomInformationProps) {
	return (
		<Accordion
			className="sticky z-1 top-14 w-72 h-full shrink-0 self-start flex flex-col bg-background/80 backdrop-blur-sm border-l overflow-y-auto"
			defaultValue={["topic", "participants", "timeline"]}
			type="multiple"
		>
			<RoomInformationTopic topic={room.topic} />
			<RoomInformationParticipantList participants={room.participants} />
			<RoomInformationMiniTimeline
				participants={room.participants}
				turns={turns}
			/>
			<RoomInformationDetails room={room} />
			<Separator />
		</Accordion>
	);
}
