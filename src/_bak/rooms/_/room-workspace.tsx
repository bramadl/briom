import { SidebarInset, SidebarProvider } from "@briom/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@briom/components/ui/sidebar.constants";
import { cookies } from "next/headers";

export async function RoomWorkspace({
	children,
	sidebar,
}: React.PropsWithChildren<{ sidebar: React.ReactNode }>) {
	const cookieStore = await cookies();
	const cookieSidebar = cookieStore.get(SIDEBAR_COOKIE_NAME);

	const defaultOpenState = cookieSidebar?.value !== "false";
	const defaultSidebarWidth = "350px";

	return (
		<SidebarProvider
			defaultOpen={defaultOpenState}
			style={{ "--sidebar-width": defaultSidebarWidth } as React.CSSProperties}
		>
			{sidebar}
			<SidebarInset className="overflow-hidden">{children}</SidebarInset>
		</SidebarProvider>
	);
}
