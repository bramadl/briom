import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { UserPlus2Icon } from "lucide-react";

export function InviteParticipant() {
	return (
		<DropdownMenuItem>
			<UserPlus2Icon className="size-4 mr-2" />
			Invite Participant
		</DropdownMenuItem>
	);
}
