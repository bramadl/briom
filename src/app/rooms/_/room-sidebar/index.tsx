"use client";

import { Logo } from "@briom/components/logo";
import { SIDEBAR_KEYBOARD_SHORTCUT } from "@briom/components/ui/sidebar.constants";
import { Kbd, KbdGroup } from "@briom/ui/kbd";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@briom/ui/sidebar";
import { Plus } from "lucide-react";

import { useRoom } from "../room-provider/use-room";
import { UserDropdownMenu } from "./user-dropdown-menu";

export function RoomSidebar({
	children,
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { openRoomFormDialog } = useRoom();
	const { open } = useSidebar();

	return (
		<Sidebar
			className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
			collapsible="icon"
			{...props}
		>
			<Sidebar
				className="w-[calc(var(--sidebar-width-icon))]! md:border-r bg-transparent"
				collapsible="none"
			>
				<SidebarHeader className="h-14 border-b">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="relative md:p-0 h-8 transition-opacity group/trigger mt-1"
								size="lg"
								tooltip={{
									children: (
										<div>
											<p>{open ? "Collapse" : "Expand"} Sidebar</p>
											<KbdGroup>
												<Kbd>⌘</Kbd>
												<Kbd>{SIDEBAR_KEYBOARD_SHORTCUT}</Kbd>
											</KbdGroup>
										</div>
									),
								}}
							>
								<div>
									<Logo
										className="ml-1 size-6! group-hover/trigger:opacity-0 transition-opacity"
										size={20}
									/>
									<SidebarTrigger className="ml-0.5 mt-0.5 absolute inset-0 text-muted-foreground opacity-0 group-hover/trigger:opacity-100 transition-opacity" />
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup className="py-3">
						<SidebarGroupContent className="px-1.5 md:px-0">
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										className="px-2.5 md:px-2"
										isActive={true}
										onClick={openRoomFormDialog}
										tooltip={{
											children: (
												<div>
													<p>New Room</p>
													<KbdGroup>
														<Kbd>⌘</Kbd>
														<Kbd>⌥</Kbd>
														<Kbd>N</Kbd>
													</KbdGroup>
												</div>
											),
											hidden: false,
										}}
									>
										<Plus />
										<span>New Room</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<UserDropdownMenu email="bram.adl@briom.com" name="Bram Adl" />
				</SidebarFooter>
			</Sidebar>

			{children}
		</Sidebar>
	);
}
