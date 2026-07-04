"use client";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@briom/components/ui/sidebar";
import { PlusIcon } from "lucide-react";

import { useRoomFormToggler } from "../../form/use-room-form-toggler";

export function SidebarQuickMenu() {
	const { disabled, toggleForm } = useRoomFormToggler({ preserve: true });
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					className="px-2.5 md:px-2"
					disabled={disabled}
					isActive={true}
					onClick={toggleForm}
				>
					<PlusIcon />
					<span>Open Room</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
