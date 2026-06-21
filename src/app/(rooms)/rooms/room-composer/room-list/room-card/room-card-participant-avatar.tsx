import { Avatar, AvatarFallback } from "@briom/components/ui/avatar";
import { cn } from "@briom/libs/utils";
import { getParticipantTheme } from "@briom/rooms/mappings/participant-colors.map";

interface RoomCardParticipantAvatarProps
	extends React.ComponentProps<typeof AvatarFallback> {
	name?: string;
	participantId?: string;
}

export function RoomCardParticipantAvatar({
	children,
	className,
	participantId,
	name,
}: RoomCardParticipantAvatarProps) {
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
