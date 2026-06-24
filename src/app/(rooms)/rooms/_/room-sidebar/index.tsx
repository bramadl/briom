import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
} from "@briom/components/ui/sidebar";

import { RoomList } from "../room-list";

import { SidebarExpander } from "./_/sidebar-expander";
import { SidebarQuickActions } from "./_/sidebar-quick-actions";

interface RoomSidebarProps {
	children: React.ReactNode;
	menu: React.ReactNode;
}

export function RoomSidebar({ children, menu }: RoomSidebarProps) {
	return (
		<Sidebar
			className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
			collapsible="icon"
		>
			<Sidebar
				className="w-[calc(var(--sidebar-width-icon))]! md:border-r bg-transparent"
				collapsible="none"
			>
				<SidebarHeader className="h-14 border-b">
					<SidebarExpander />
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup className="py-3">
						<SidebarGroupContent className="px-1.5 md:px-0">
							<SidebarQuickActions />
						</SidebarGroupContent>
					</SidebarGroup>
					<SidebarGroup className="border-t md:hidden">
						<SidebarGroupContent>
							<RoomList />
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter className="border-t md:border-t-0">{menu}</SidebarFooter>
			</Sidebar>
			{children}
		</Sidebar>
	);
}
