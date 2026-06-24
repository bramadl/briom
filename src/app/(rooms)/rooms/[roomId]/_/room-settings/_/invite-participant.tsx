import { Button } from "@briom/components/ui/button";
import { UserPlus2Icon } from "lucide-react";

export function InviteParticipant() {
	return (
		<Button>
			<UserPlus2Icon className="size-4 mr-2" />
			Invite Participant
		</Button>
	);
}
