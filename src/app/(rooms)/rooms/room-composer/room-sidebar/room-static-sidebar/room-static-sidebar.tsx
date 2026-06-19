import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
} from "@briom/components/ui/sidebar";

interface RoomStaticSidebarProps {
	children: React.ReactNode;
	footer: React.ReactNode;
	header: React.ReactNode;
}

export function RoomStaticSidebar({
	children,
	footer,
	header,
}: RoomStaticSidebarProps) {
	return (
		<Sidebar
			className="w-[calc(var(--sidebar-width-icon))]! md:border-r bg-transparent"
			collapsible="none"
		>
			<SidebarHeader className="h-14 border-b">{header}</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="py-3">
					<SidebarGroupContent className="px-1.5 md:px-0">
						{children}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>{footer}</SidebarFooter>
		</Sidebar>
	);
}
