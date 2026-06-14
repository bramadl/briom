import { AppSidebar } from "@briom/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@briom/components/ui/sidebar";

export default function RoomsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider
			style={{ "--sidebar-width": "350px" } as React.CSSProperties}
		>
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 shrink-0 h-14 px-4 flex items-center border-b bg-background">
					<h1 className="font-serif">
						Rethinking Universal Basic Income in an AI Economy
					</h1>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
