import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { Share2Icon } from "lucide-react";

export function ShareRoom() {
	return (
		<DropdownMenuItem disabled>
			<Share2Icon className="size-4 mr-2" />
			Share Room
		</DropdownMenuItem>
	);
}
