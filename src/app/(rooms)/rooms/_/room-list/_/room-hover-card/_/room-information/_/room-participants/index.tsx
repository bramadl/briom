import type { RoomDTO } from "@briom/app";

import { ParticipantBubbles } from "./_/participant-bubbles";

interface RoomParticipantsProps {
	participants: RoomDTO["participants"];
}

export function RoomParticipants({ participants }: RoomParticipantsProps) {
	return (
		<div className="flex items-center justify-between">
			<ParticipantBubbles participants={participants} />
			<span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
				{participants.length > 0
					? `${participants.length} participant${participants.length > 1 ? "s" : ""}`
					: "Awaiting invite"}
			</span>
		</div>
	);
}
