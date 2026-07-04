"use client";

import { Kbd, KbdGroup } from "@briom/components/ui/kbd";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@briom/components/ui/sidebar";
import { ROOM_FORM_SHORTCUT } from "@briom/room/form/shortcut";
import { PlusIcon } from "lucide-react";

import { useRoomFormToggler } from "../../../form/hooks/use-room-form-toggler";

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
					tooltip={{
						children: (
							<KbdGroup>
								{ROOM_FORM_SHORTCUT.keys.map((key) => (
									<Kbd key={key}>{key}</Kbd>
								))}
							</KbdGroup>
						),
					}}
				>
					<PlusIcon />
					<span>Open Room</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
