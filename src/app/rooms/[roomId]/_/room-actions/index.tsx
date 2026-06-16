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
import {
	ArchiveIcon,
	DeleteIcon,
	EllipsisVertical,
	ScrollTextIcon,
	Share2Icon,
} from "lucide-react";
import { useState } from "react";
import { DeleteRoom } from "./delete-room";

interface RoomActionsProps {
	roomId: string;
}

export function RoomActions({ roomId }: RoomActionsProps) {
	const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);

	return (
		<div className="ml-auto flex items-center gap-1.5">
			<DeleteRoom
				onOpenChange={setDeleteDialogOpened}
				open={deleteDialogOpened}
				roomId={roomId}
			/>

			<Button className="hidden md:flex" disabled variant="secondary">
				<ScrollTextIcon />
				Summarize
			</Button>
			<Button className="hidden md:flex" disabled variant="secondary">
				<Share2Icon />
				Share
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="icon" variant="secondary">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-40">
					<DropdownMenuGroup className="lg:hidden">
						<DropdownMenuLabel>Room Options</DropdownMenuLabel>
						<DropdownMenuItem disabled>
							<ScrollTextIcon />
							Summarize Chat
						</DropdownMenuItem>
						<DropdownMenuItem disabled>
							<Share2Icon />
							Share Room
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator className="lg:hidden" />
					<DropdownMenuGroup>
						<DropdownMenuLabel>Room Settings</DropdownMenuLabel>
						<DropdownMenuItem disabled>
							<ArchiveIcon />
							Archive Room
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setDeleteDialogOpened(true)}>
							<DeleteIcon />
							Delete Room
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
