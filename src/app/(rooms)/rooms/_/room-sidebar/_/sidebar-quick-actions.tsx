"use client";

import { Kbd, KbdGroup } from "@briom/components/ui/kbd";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@briom/components/ui/sidebar";
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";
import { useRoomFormStore } from "@briom/rooms/_/room/form/use-room-form-store";
import { PlusIcon } from "lucide-react";

export function SidebarQuickActions() {
	const showForm = useRoomFormStore((s) => s.show);

	const menu = [
		{
			action: showForm,
			icon: PlusIcon,
			label: "Open Room",
			tooltip: {
				children: (
					<div>
						<p>New Room</p>
						<KbdGroup>
							{ROOM_SETTING.SHORTCUTS.create.tokens.map((shortcut) => (
								<Kbd key={shortcut}>{shortcut}</Kbd>
							))}
						</KbdGroup>
					</div>
				),
				hidden: false,
			},
		},
	];

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
