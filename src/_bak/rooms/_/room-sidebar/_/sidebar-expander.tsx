"use client";

import { Logo } from "@briom/components/logo";
import { Kbd, KbdGroup } from "@briom/components/ui/kbd";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@briom/components/ui/sidebar";
import { ROOM_SETTING } from "@briom/rooms/_/room/config/setting";

export function SidebarExpander() {
	const { open } = useSidebar();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					asChild
					className="relative md:p-0 h-8 transition-opacity mt-1"
					size="lg"
					tooltip={{
						children: (
							<div>
								<p>{open ? "Collapse" : "Expand"} Sidebar</p>
								<KbdGroup>
									{ROOM_SETTING.SHORTCUTS.sidebar.tokens.map((shortcut) => (
										<Kbd key={shortcut}>{shortcut}</Kbd>
									))}
								</KbdGroup>
							</div>
						),
					}}
				>
					<span>
						<Logo className="ml-1 size-6! group-hover:opacity-0 transition-opacity" />
						<SidebarTrigger className="ml-0.5 mt-0.5 absolute inset-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
					</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
