"use client";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@briom/components/ui/sidebar";
import { roomShortcuts } from "@briom/rooms/settings/room-shortcuts";

import { useRoomFormDialog } from "../../room-form-dialog";

import { newRoomOption } from "./new-room-option";

export function RoomSidebarMenu() {
	const { showForm } = useRoomFormDialog();

	const menu = [newRoomOption(showForm, roomShortcuts.create)];

	return (
		<SidebarMenu>
			{menu.map((menu) => (
				<SidebarMenuItem key={menu.label}>
					<SidebarMenuButton
						className="px-2.5 md:px-2"
						isActive={true}
						onClick={menu.action}
						tooltip={menu.tooltip}
					>
						<menu.icon />
						<span>{menu.label}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}
