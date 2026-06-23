import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { MessageCircleOffIcon } from "lucide-react";

export function CloseRoom() {
	return (
		<DropdownMenuItem variant="destructive">
			<MessageCircleOffIcon className="size-4 mr-2" />
			Close Room
		</DropdownMenuItem>
	);
}
