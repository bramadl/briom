import { Kbd, KbdGroup } from "@briom/components/ui/kbd";

interface NewRoomTriggerButtonTooltipProps {
	shortcuts: string[];
}

export function NewRoomTriggerButtonTooltip({
	shortcuts,
}: NewRoomTriggerButtonTooltipProps) {
	return (
		<div>
			<p>New Room</p>
			<KbdGroup>
				{shortcuts.map((shortcut) => (
					<Kbd key={shortcut}>{shortcut}</Kbd>
				))}
			</KbdGroup>
		</div>
	);
}
