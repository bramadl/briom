import type { RoomDTO, TurnDTO } from "@briom/app";

import { ModeratorInput } from "./moderator-input";
import {
	// EmptySequence,
	TurnSequence,
} from "./turn-sequence";

interface RoomDiscussionProps {
	room: RoomDTO;
	turns: TurnDTO[];
}

export function RoomDiscussion({ room, turns }: RoomDiscussionProps) {
	// const isFreshRoom = turns.length === 0;
	const isMultiDiscussionRoom = room.participants.length > 1;

	const participantsMap = new Map<string, RoomDTO["participants"][number]>();
	room.participants.forEach((p) => {
		participantsMap.set(p.id, p);
	});

	const turnsWithParticipant = turns.map<
		TurnDTO & { participant: RoomDTO["participants"][number] | null }
	>((t) => ({
		...t,
		participant:
			t.author.type === "participant"
				? (participantsMap.get(t.author.participantId as string) ?? null)
				: null,
	}));

	return (
		<section className="min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			<div className="flex-1 flex flex-col gap-8 p-8 min-h-0 overflow-y-auto">
				{/* {isFreshRoom && <EmptySequence participants={room.participants} />}
				{!isFreshRoom && <TurnSequence turns={turns} />} */}
				<TurnSequence
					isMultiDiscussionRoom={isMultiDiscussionRoom}
					turns={turnsWithParticipant}
				/>
			</div>
			<div className="sticky bottom-0 z-50 shrink-0 p-8 pt-0">
				<ModeratorInput
					isMultiDiscussionRoom={isMultiDiscussionRoom}
					participants={room.participants}
				/>
			</div>
		</section>
	);
}
