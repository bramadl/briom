import type { RoomOverviewDTO } from "@briom/app/bak";
import { ParticipantBadge } from "@briom/rooms/_/participant/ui/participant-badge";

interface ParticipantInfoProps {
	participant: RoomOverviewDTO["participants"][number];
}

export function ParticipantInfo({ participant }: ParticipantInfoProps) {
	return (
		<div className="flex items-start gap-2 rounded-md p-2 pb-1 transition-colors hover:bg-muted">
			<ParticipantBadge
				name={participant.name}
				participantId={participant.id}
			/>
			<div className="flex flex-col">
				<span className="text-sm font-medium leading-none">
					{participant.name}
				</span>
				<span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
					{participant.model}
				</span>
			</div>
		</div>
	);
}
