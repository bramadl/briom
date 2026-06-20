import type { RoomDTO, TurnDTO } from "@briom/app";

import { ModeratorTurn } from "./moderator-turn";
import { ParticipantTurn } from "./participant-turn";

interface TurnSequenceProps {
	isMultiDiscussionRoom?: boolean;
	turns: (TurnDTO & { participant: RoomDTO["participants"][number] | null })[];
}

export function TurnSequence({
	isMultiDiscussionRoom,
	turns,
}: TurnSequenceProps) {
	return (
		<div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
			<ModeratorTurn />
			{/* <ParticipantTurn participant={turns[0].participant} /> */}
			<ParticipantTurn isMultiDiscussionRoom={isMultiDiscussionRoom} />
		</div>
	);
}
