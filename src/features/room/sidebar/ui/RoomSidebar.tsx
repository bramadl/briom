"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuItem,
	SidebarProvider,
} from "@briom/components/ui/sidebar";

import { SidebarLogoTrigger } from "./internal/SidebarLogoTrigger";
import { SidebarModeratorMenu } from "./internal/SidebarModeratorMenu";
import { SidebarQuickMenu } from "./internal/SidebarQuickMenu";
import { SidebarRoomAvailability } from "./internal/SidebarRoomAvailability";
import { SidebarRoomList } from "./internal/SidebarRoomList";

interface RoomSidebarProps {
	/**
	 * @description
	 * Determine wether the sidebar should be opened
	 * or closed on a fresh page load.
	 *
	 * Typically requires use of cookies from a server
	 * component parent.
	 */
	defaultState: "opened" | "closed";

	/**
	 * @description
	 * Main page which being rendered by the sidebar.
	 *
	 * The page might requires toggling the Sidebar,
	 * hence, the page has to be rendered inside it.
	 */
	mainPage: React.ReactNode;
}

export function RoomSidebar({
	defaultState = "closed",
	mainPage,
}: RoomSidebarProps) {
	return (
		<SidebarProvider
			defaultOpen={defaultState === "opened"}
			style={{ "--sidebar-width": "350px" } as React.CSSProperties}
		>
			<Sidebar
				className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
				collapsible="icon"
			>
				<Sidebar
					className="w-[calc(var(--sidebar-width-icon))]! md:border-r bg-transparent"
					collapsible="none"
				>
					<SidebarHeader className="h-14 border-b">
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarLogoTrigger />
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup className="py-3">
							<SidebarGroupContent className="px-1.5 md:px-0">
								<SidebarQuickMenu />
							</SidebarGroupContent>
						</SidebarGroup>
						<SidebarGroup className="border-t md:hidden">
							<SidebarGroupContent>
								<SidebarRoomList />
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter className="border-t md:border-t-0">
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarModeratorMenu />
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>
				<Sidebar className="hidden flex-1 md:flex" collapsible="none">
					<SidebarHeader className="h-14 border-b border-sidebar-border justify-center px-4">
						<div className="flex items-center justify-between gap-4">
							<h2 className="text-muted-foreground text-sm whitespace-nowrap">
								Rooms
							</h2>
							<SidebarRoomAvailability />
						</div>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup className="flex-1 px-0 py-0">
							<SidebarGroupContent className="flex-1">
								<SidebarRoomList />
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
			</Sidebar>
			<SidebarInset className="overflow-hidden">{mainPage}</SidebarInset>
		</SidebarProvider>
	);
}
