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
import { ConcludeRoomOption } from "./internal/ConcludeRoomOption";
import { InviteParticipantOption } from "./internal/InviteParticipantOption";

export function RoomSetting() {
	const { canInviteParticipant, isForming, isDeliberating } = useRoom();
	return (
		<div className="flex items-center gap-1">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="icon" variant="secondary">
						<EllipsisVertical className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Room Settings</DropdownMenuLabel>
						{canInviteParticipant && isForming && <InviteParticipantOption />}
						{isDeliberating && <ConcludeRoomOption />}
						<DropdownMenuSeparator />
						<CloseRoomOption />
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
