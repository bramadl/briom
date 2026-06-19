import { Kbd, KbdGroup } from "@briom/components/ui/kbd";

interface SidebarHoverableLogoExpanderShortcutProps {
	shortcuts: string[];
}

export function SidebarHoverableLogoExpanderShortcut({
	shortcuts,
}: SidebarHoverableLogoExpanderShortcutProps) {
	return (
		<KbdGroup>
			{shortcuts.map((shortcut) => (
				<Kbd key={shortcut}>{shortcut}</Kbd>
			))}
		</KbdGroup>
	);
}
