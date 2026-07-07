import { DropdownMenuItem } from "@briom/components/ui/dropdown-menu";
import { UserPlus2Icon } from "lucide-react";

export function InviteParticipantOption() {
	return (
		<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
			<UserPlus2Icon />
			Invite Participant
		</DropdownMenuItem>
	);
}
