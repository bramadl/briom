import { SidebarHoverableLogoExpanderShortcut } from "./sidebar-hoverable-logo-expander-shortcut";

interface SidebarHoverableLogoExpanderTooltipProps {
	isExpanded?: boolean;
	shortcuts: string[];
}

export function SidebarHoverableLogoExpanderTooltip({
	isExpanded,
	shortcuts,
}: SidebarHoverableLogoExpanderTooltipProps) {
	return (
		<div>
			<p>{isExpanded ? "Collapse" : "Expand"} Sidebar</p>
			<SidebarHoverableLogoExpanderShortcut shortcuts={shortcuts} />
		</div>
	);
}
