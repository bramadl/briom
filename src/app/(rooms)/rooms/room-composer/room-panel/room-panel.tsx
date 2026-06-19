import { SidebarInset } from "@briom/components/ui/sidebar";

export function RoomPanel({ children }: React.PropsWithChildren) {
	return <SidebarInset>{children}</SidebarInset>;
}
