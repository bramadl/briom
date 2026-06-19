import { Sidebar } from "@briom/components/ui/sidebar";

export function RoomSidebar({ children }: React.PropsWithChildren) {
	return (
		<Sidebar
			className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
			collapsible="icon"
		>
			{children}
		</Sidebar>
	);
}
