import { Avatar, AvatarFallback } from "@briom/components/ui/avatar";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/_/participant/config/theme";

interface ParticipantBadgeProps
	extends React.ComponentProps<typeof AvatarFallback> {
	name?: string;
	participantId?: string;
}

export function ParticipantBadge({
	children,
	className,
	participantId,
	name,
}: ParticipantBadgeProps) {
	if (!children && !name) throw new Error("Name or children must be specified");
	name = name as string;

	const initials = name.charAt(0).toUpperCase() + name.charAt(1).toLowerCase();
	const theme = getParticipantTheme(participantId);

	return (
		<Avatar className="size-6 ring-2 ring-muted">
			<AvatarFallback
				className={cn(
					"text-[9px] font-medium text-foreground",
					theme?.all,
					className,
				)}
			>
				{children ?? initials}
			</AvatarFallback>
		</Avatar>
	);
}
