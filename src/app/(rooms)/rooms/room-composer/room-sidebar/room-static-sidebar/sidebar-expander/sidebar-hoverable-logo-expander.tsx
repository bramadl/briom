import { Logo } from "@briom/components/logo";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@briom/components/ui/sidebar";

import { SidebarHoverableLogoExpanderTooltip } from "./sidebar-hoverable-logo-expander-tooltip";

interface SidebarHoverableLogoExpanderProps {
	shortcuts: string[];
}

export function SidebarHoverableLogoExpander({
	shortcuts,
}: SidebarHoverableLogoExpanderProps) {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					asChild
					className="relative md:p-0 h-8 transition-opacity mt-1"
					size="lg"
					tooltip={{
						children: (
							<SidebarHoverableLogoExpanderTooltip shortcuts={shortcuts} />
						),
					}}
				>
					<span>
						<Logo className="ml-1 size-6! group-hover:opacity-0 transition-opacity" />
						<SidebarTrigger className="ml-0.5 mt-0.5 absolute inset-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
					</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
