import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
} from "@briom/components/ui/sidebar";

export function RoomListRenderer({ children }: React.PropsWithChildren) {
	return (
		<SidebarContent>
			<SidebarGroup className="flex-1 px-0 py-0">
				<SidebarGroupContent className="flex-1">{children}</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
}
