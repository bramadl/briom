import type { RoomDTO } from "@briom/app";

import { RoomCardParticipantAvatar } from "./room-card-participant-avatar";

export function RoomCardParticipantList({
	participants,
}: {
	participants: RoomDTO["participants"];
}) {
	if (participants.length === 0) {
		return (
			<div className="py-2 text-center">
				<p className="text-sm text-muted-foreground italic">
					No participants invited yet.
				</p>
				<p className="text-[10px] font-mono text-muted-foreground/50 mt-1">
					Open this room to invite participants.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">
				{participants.length} participant{participants.length > 1 ? "s" : ""} in
				this deliberation
			</span>
			<div className="flex flex-col gap-1.5">
				{participants.map((participant, index) => (
					<div
						className="flex items-start gap-2 rounded-md p-2 pb-1 transition-colors hover:bg-muted"
						key={participant.id}
					>
						<RoomCardParticipantAvatar index={index} name={participant.name} />
						<div className="flex flex-col">
							<span className="text-sm font-medium leading-none">
								{participant.name}
							</span>
							<span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
								{participant.provider}/{participant.model}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
