import type { RoomDTO } from "@briom/app";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";

interface ParticipantInfoProps {
	participant: RoomDTO["participants"][number];
}

export function ParticipantInfo({ participant }: ParticipantInfoProps) {
	const theme = getParticipantTheme(participant.id);
	return (
		<li className="flex items-start gap-2.5">
			<span
				className={cn(
					"w-2 h-2 rounded-full shrink-0 translate-y-[7px]",
					theme.dot,
				)}
			/>
			<div className="min-w-0 flex flex-col gap-0">
				<p className="text-sm text-foreground truncate mb-0!">
					{participant.name}
				</p>
				<p className="text-[10px] text-muted-foreground/60 font-mono truncate">
					{participant.provider}/{participant.model}
				</p>
			</div>
		</li>
	);
}
