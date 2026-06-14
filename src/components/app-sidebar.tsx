"use client";

import { Logo } from "@briom/components/logo";
import { UserDropdownMenu } from "@briom/components/user-dropdown-menu";
import { Badge } from "@briom/ui/badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@briom/ui/tooltip";
import { Plus } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open } = useSidebar();

	return (
		<Sidebar
			className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
			collapsible="icon"
			{...props}
		>
			<Sidebar
				className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r bg-transparent"
				collapsible="none"
			>
				<SidebarHeader className="h-14 border-b">
					<SidebarMenu>
						<Tooltip>
							<SidebarMenuItem>
								<TooltipTrigger asChild>
									<SidebarMenuButton
										asChild
										className="relative md:p-0 md:h-8 transition-opacity group/trigger mt-1"
										size="lg"
									>
										<div>
											<Logo
												className="ml-1 size-6! group-hover/trigger:opacity-0 transition-opacity"
												size={20}
											/>
											<SidebarTrigger className="ml-0.5 mt-0.5 absolute inset-0 text-muted-foreground opacity-0 group-hover/trigger:opacity-100 transition-opacity" />
										</div>
									</SidebarMenuButton>
								</TooltipTrigger>
								<TooltipContent side="right">
									<p>{open ? "Collapse" : "Expand"} Sidebar</p>
									<KbdGroup>
										<Kbd>⌘</Kbd>
										<Kbd>B</Kbd>
									</KbdGroup>
								</TooltipContent>
							</SidebarMenuItem>
						</Tooltip>
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
										tooltip={{
											children: "New Room",
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

			<Sidebar className="hidden flex-1 md:flex" collapsible="none">
				<SidebarHeader className="h-14 border-b border-sidebar-border justify-center px-4">
					<div className="flex items-center justify-between gap-4">
						<h2 className="text-muted-foreground text-sm whitespace-nowrap">
							My Rooms
						</h2>
						<Badge>2</Badge>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup className="px-0 py-0">
						<SidebarGroupContent>
							<div className="flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 bg-muted/50">
								<div className="flex w-full items-center gap-2">
									<h2>DDD untuk Briom</h2>
									<p className="ml-auto text-xs">19:40</p>
								</div>
								<span className="font-medium">4 AI Participants</span>
								<span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
									Informasi which idk what
								</span>
							</div>
							<div className="flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-muted/25">
								<div className="flex w-full items-center gap-2">
									<h2>Strategi Monetisasi</h2>
									<p className="ml-auto text-xs">15:12</p>
								</div>
								<span className="font-medium">2 AI Participants</span>
								<span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
									Informasi which idk what
								</span>
							</div>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	);
}
