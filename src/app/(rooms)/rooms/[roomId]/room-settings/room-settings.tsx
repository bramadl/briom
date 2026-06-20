import type { RoomDTO } from "@briom/app";
import { Button } from "@briom/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@briom/components/ui/dropdown-menu";
import {
	ArchiveIcon,
	ConciergeBellIcon,
	EllipsisVertical,
	MessageCircleOffIcon,
	Share2Icon,
} from "lucide-react";

export function RoomSettings({ room }: { room: RoomDTO }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="secondary">
					<EllipsisVertical className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Room Settings</DropdownMenuLabel>

					<DropdownMenuSeparator />

					{room.status === "concluded" ? (
						<DropdownMenuItem>
							<Share2Icon className="size-4 mr-2" />
							Share Discussion
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem>
							<ConciergeBellIcon className="size-4 mr-2" />
							Conclude Discussion
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator />

					{room.status === "concluded" ? (
						<DropdownMenuItem>
							<ArchiveIcon className="size-4 mr-2" />
							Archive Room
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem variant="destructive">
							<MessageCircleOffIcon className="size-4 mr-2" />
							Close Room
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
