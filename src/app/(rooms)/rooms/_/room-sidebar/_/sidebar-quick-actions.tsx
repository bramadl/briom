"use client";

import { Kbd, KbdGroup } from "@briom/components/ui/kbd";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@briom/components/ui/sidebar";
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";
import { useRooms } from "@briom/rooms/_/room/hooks/use-rooms";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function SidebarQuickActions() {
	const router = useRouter();

	const { isMaxReached } = useRooms();
	const menu = [
		{
			action: () => router.push("/rooms/new"),
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
			{menu.map((item) => (
				<SidebarMenuItem key={item.label}>
					<SidebarMenuButton
						className="px-2.5 md:px-2"
						disabled={isMaxReached}
						isActive={true}
						onClick={item.action}
						tooltip={item.tooltip}
					>
						<item.icon />
						<span>{item.label}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}
