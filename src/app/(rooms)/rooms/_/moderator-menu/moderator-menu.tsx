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

import { MenuOptions } from "./_/menu-options";
import { MenuProfile } from "./_/menu-profile";
import { MenuTrigger } from "./_/menu-trigger";

interface ModeratorMenuProps {
	user: {
		avatar?: string | null;
		email: string;
		name: string;
	};
}

export function ModeratorMenu({ user }: ModeratorMenuProps) {
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
							<MenuTrigger
								avatar={user.avatar ?? undefined}
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
							<MenuProfile
								avatar={user.avatar}
								email={user.email}
								name={user.name}
							/>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<MenuOptions />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
