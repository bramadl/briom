"use client";

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
import { useRoom } from "@briom/rooms/_bak/hooks/store";
import {
	ArchiveIcon,
	ConciergeBellIcon,
	EllipsisVertical,
	MessageCircleOffIcon,
	Share2Icon,
	UserPlus2Icon,
} from "lucide-react";
import { Fragment } from "react/jsx-runtime";

export function RoomSettings() {
	const { room } = useRoom();

	const isConcluded = room.status === "concluded";
	const isDeliberating = room.status === "deliberating";
	const isForming = room.status === "forming";

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

					{isForming && (
						<DropdownMenuItem>
							<UserPlus2Icon className="size-4 mr-2" />
							Invite Participant
						</DropdownMenuItem>
					)}

					{isDeliberating && (
						<DropdownMenuItem>
							<ConciergeBellIcon className="size-4 mr-2" />
							Conclude Discussion
						</DropdownMenuItem>
					)}

					{isConcluded && (
						<Fragment>
							<Button size="sm" variant="secondary">
								<Share2Icon className="size-4 mr-1.5" />
								Share Room
							</Button>
							<DropdownMenuItem>
								<ArchiveIcon className="size-4 mr-2" />
								Archive Room
							</DropdownMenuItem>
						</Fragment>
					)}

					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive">
						<MessageCircleOffIcon className="size-4 mr-2" />
						Close Room
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
