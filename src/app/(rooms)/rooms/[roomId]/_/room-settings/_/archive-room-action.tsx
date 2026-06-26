import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { ArchiveIcon } from "lucide-react";

export function ArchiveRoom() {
	return (
		<DropdownMenuItem disabled>
			<ArchiveIcon className="size-4 mr-2" />
			Archive Room
		</DropdownMenuItem>
	);
}
