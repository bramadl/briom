"use client";

import { Button } from "@briom/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@briom/components/ui/dropdown-menu";
import { useRoom } from "@briom/room/hooks/use-room";
import { EllipsisVertical } from "lucide-react";

import { CloseRoomOption } from "./internal/CloseRoomOption";
import { ConcludeRoomButton } from "./internal/ConcludeRoomButton";
import { InviteParticipantButton } from "./internal/InviteParticipantButton";

export function RoomSetting() {
	const { canInviteParticipant, isForming, isDeliberating } = useRoom();
	return (
		<div className="flex items-center gap-1">
			{canInviteParticipant && isForming && <InviteParticipantButton />}
			{isDeliberating && <ConcludeRoomButton />}
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
						<CloseRoomOption />
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
