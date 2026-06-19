import { RoomCardParticipantAvatar } from "./room-card-participant-avatar";

interface ParticipantBubblesProps {
	participants: Array<{ id: string; name: string }>;
}

export function RoomCardParticipantBubbles({
	participants,
}: ParticipantBubblesProps) {
	if (participants.length === 0) {
		return (
			<span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
				No perspectives
			</span>
		);
	}

	return (
		<div className="flex items-center -space-x-1.5">
			{participants.slice(0, 4).map((participant, index) => (
				<RoomCardParticipantAvatar
					index={index}
					key={participant.id}
					name={participant.name}
				/>
			))}
			{participants.length > 4 && (
				<RoomCardParticipantAvatar className="bg-muted" />
			)}
		</div>
	);
}
