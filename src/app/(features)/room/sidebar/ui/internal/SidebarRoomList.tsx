"use client";

import { cn } from "@briom/libs/utils";
import { MessageCircleIcon } from "lucide-react";

import { useRooms } from "../../../hooks/use-rooms";
import { SidebarRoomItem } from "./SidebarRoomItem";

function SidebarRoomListEmpty() {
	return (
		<div
			className={cn(
				"flex-1 h-full flex flex-col items-center justify-center gap-4 px-8 py-8 text-center",
				"opacity-100 transition-opacity duration-150 delay-200 ease-out",
				"group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:duration-75",
				"group-data-[collapsible=icon]:delay-0 group-data-[collapsible=icon]:ease-in",
			)}
		>
			<div className="text-muted-foreground/40 ">
				<MessageCircleIcon size={20} />
			</div>
			<div className="flex flex-col gap-1.5">
				<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap">
					No rooms yet
				</p>
				<div className="flex flex-col gap-0.5">
					<h3 className="font-serif text-sm whitespace-nowrap">
						Open your first room
					</h3>
					<p className="text-xs text-muted-foreground/70 leading-relaxed">
						Invite AI participants to discuss ideas together
					</p>
				</div>
			</div>
		</div>
	);
}

export function SidebarRoomList() {
	const { isEmpty, rooms } = useRooms();

	if (isEmpty) return <SidebarRoomListEmpty />;
	return rooms.map((room) => <SidebarRoomItem key={room.shortId} {...room} />);
}
