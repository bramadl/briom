import { SidebarProvider } from "@briom/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@briom/components/ui/sidebar.constants";
import { cookies } from "next/headers";

import { RoomFormDialogProvider } from "./room-form-dialog";

export async function RoomComposer({ children }: React.PropsWithChildren) {
	const cookieStore = await cookies();
	const cookieSidebar = cookieStore.get(SIDEBAR_COOKIE_NAME);

	const defaultOpenState = cookieSidebar?.value !== "false";
	const defaultSidebarWith = "350px";

	return (
		<RoomFormDialogProvider>
			<SidebarProvider
				defaultOpen={defaultOpenState}
				style={{ "--sidebar-width": defaultSidebarWith } as React.CSSProperties}
			>
				{children}
			</SidebarProvider>
		</RoomFormDialogProvider>
	);
}
