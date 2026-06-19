import { Sidebar } from "@briom/components/ui/sidebar";

export function RoomCollapsibleSidebar({ children }: React.PropsWithChildren) {
	return (
		<Sidebar className="hidden flex-1 md:flex" collapsible="none">
			{children}
		</Sidebar>
	);
}
