import type {
	RoomDeliberationParticipantDTO,
	RoomDeliberationTurnDTO,
} from "@briom/app/bak";
import { Badge } from "@briom/components/ui/badge";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";

interface ParticipantInfoProps {
	isFailed?: boolean;
	isStreaming?: boolean;
	participant: RoomDeliberationParticipantDTO;
	showIntent?: boolean;
	turn: RoomDeliberationTurnDTO;
}

export function ParticipantInfo({
	isFailed,
	isStreaming,
	participant,
	turn,
	showIntent,
}: ParticipantInfoProps) {
	const theme = getParticipantTheme(participant.id);

	return (
		<div className="flex flex-col mb-2">
			<div className="flex items-center gap-2">
				<span className={cn("text-sm font-medium font-serif", theme.text)}>
					{participant.name}
				</span>
				{showIntent && (
					<Badge
						className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 border-border/50 text-muted-foreground font-mono"
						variant="outline"
					>
						{turn.intent}
					</Badge>
				)}
				{isStreaming && (
					<span
						className={cn("text-[10px] tracking-wide opacity-60", theme.text)}
					>
						writing
					</span>
				)}
				{isFailed && (
					<Badge
						className="text-[10px] uppercase tracking-widest px-2 py-0 h-4 font-mono"
						variant="destructive"
					>
						missed
					</Badge>
				)}
			</div>
			<span className="text-xs text-muted-foreground">{participant.model}</span>
		</div>
	);
}
