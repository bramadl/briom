import type { RoomDTO } from "@briom/app";
import { ParticipantCount } from "./_/participant-count";
import { ParticipantEmpty } from "./_/participant-empty";
import { ParticipantInfo } from "./_/participant-info";

export function RoomParticipants({
	participants,
}: {
	participants: RoomDTO["participants"];
}) {
	if (participants.length === 0) return <ParticipantEmpty />;
	return (
		<div className="flex flex-col gap-2">
			<ParticipantCount count={participants.length} />
			<div className="flex flex-col gap-1.5">
				{participants.map((participant) => (
					<ParticipantInfo key={participant.id} participant={participant} />
				))}
			</div>
		</div>
	);
}
