import type { RoomOverviewDTO } from "@briom/app";
import { ParticipantBadge } from "@briom/rooms/_/participant/ui/participant-badge";

interface ParticipantBubblesProps {
	participants: RoomOverviewDTO["participants"];
}

export function ParticipantBubbles({ participants }: ParticipantBubblesProps) {
	if (participants.length === 0) {
		return (
			<span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
				No participants yet
			</span>
		);
	}

	return (
		<div className="flex items-center -space-x-1.5">
			{participants.slice(0, 4).map((participant) => (
				<ParticipantBadge
					key={participant.id}
					name={participant.name}
					participantId={participant.id}
				/>
			))}
			{participants.length > 4 && <ParticipantBadge className="bg-muted" />}
		</div>
	);
}
