import { Avatar, AvatarFallback } from "@briom/components/ui/avatar";
import { cn } from "@briom/libs/utils";

export const PARTICIPANT_COLORS = [
	"bg-rose-900",
	"bg-orange-900",
	"bg-amber-900",
	"bg-emerald-900",
	"bg-teal-900",
	"bg-sky-900",
	"bg-indigo-900",
	"bg-violet-900",
] as const;

interface RoomCardParticipantAvatarProps
	extends React.ComponentProps<typeof AvatarFallback> {
	index?: number;
	name?: string;
}

export function RoomCardParticipantAvatar({
	children,
	className,
	index,
	name,
}: RoomCardParticipantAvatarProps) {
	if (!children && !name) throw new Error("Name or children must be specified");
	name = name as string;
	const initials = name.charAt(0).toUpperCase() + name.charAt(1).toLowerCase();

	return (
		<Avatar className="size-6 ring-2 ring-muted">
			<AvatarFallback
				className={cn(
					"text-[9px] font-medium text-foreground",
					index !== undefined &&
						PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
					className,
				)}
			>
				{children ?? initials}
			</AvatarFallback>
		</Avatar>
	);
}
