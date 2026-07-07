import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { ConciergeBellIcon } from "lucide-react";

export function ConcludeRoomOption() {
	return (
		<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
			<ConciergeBellIcon />
			Conclude Room
		</DropdownMenuItem>
	);
}
