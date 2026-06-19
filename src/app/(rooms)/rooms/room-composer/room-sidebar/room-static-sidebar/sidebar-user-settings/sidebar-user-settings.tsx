"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@briom/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@briom/ui/sidebar";

import { SidebarUserSettingsOptions } from "./sidebar-user-settings-options";
import { SidebarUserSettingsProfile } from "./sidebar-user-settings-profile";
import { SidebarUserSettingsTrigger } from "./sidebar-user-settings-trigger";

interface SidebarUserSettingsProps {
	user: {
		avatar?: string;
		email: string;
		name: string;
	};
}

export function SidebarUserSettings({ user }: SidebarUserSettingsProps) {
	const { isMobile } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							asChild
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:p-0 md:h-8"
							size="lg"
						>
							<SidebarUserSettingsTrigger
								avatar={user.avatar}
								email={user.email}
								name={user.name}
							/>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						sideOffset={10}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<SidebarUserSettingsProfile
								avatar={user.avatar}
								email={user.email}
								name={user.name}
							/>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<SidebarUserSettingsOptions />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
