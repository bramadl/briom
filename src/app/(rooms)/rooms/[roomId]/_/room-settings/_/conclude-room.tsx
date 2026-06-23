import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { ConciergeBellIcon } from "lucide-react";

export function ConcludeRoom() {
	return (
		<DropdownMenuItem>
			<ConciergeBellIcon className="size-4 mr-2" />
			Conclude Discussion
		</DropdownMenuItem>
	);
}
