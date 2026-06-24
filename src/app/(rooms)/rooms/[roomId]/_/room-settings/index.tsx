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
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";
import { useRoom } from "@briom/rooms/_/room/queries/data/use-room";
import { EllipsisVertical } from "lucide-react";
import { useParams } from "next/navigation";
import { Fragment } from "react/jsx-runtime";

import { ArchiveRoom } from "./_/archive-room";
import { CloseRoom } from "./_/close-room";
import { ConcludeRoom } from "./_/conclude-room";
import { InviteParticipant } from "./_/invite-participant";
import { ShareRoom } from "./_/share-room";

export function RoomSettings() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room } = useRoom(roomId);

	const isConcluded = room.status === "concluded";
	const isDeliberating = room.status === "deliberating";
	const isForming = room.status === "forming";
	const maxParticipantReached =
		room.participants.length >= ROOM_SETTING.MAXIMUM_PARTICIPANT;

	return (
		<div className="flex items-center gap-1">
			{isForming && !maxParticipantReached && (
				<InviteParticipant
					existingParticipants={room.participants}
					roomId={roomId}
				/>
			)}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="icon" variant="secondary">
						<EllipsisVertical className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Room Settings</DropdownMenuLabel>
						{isDeliberating && (
							<Fragment>
								<DropdownMenuSeparator />
								<ConcludeRoom />
							</Fragment>
						)}
						{isConcluded && (
							<Fragment>
								<ShareRoom />
								<ArchiveRoom />
							</Fragment>
						)}
						<DropdownMenuSeparator />
						<CloseRoom />
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
