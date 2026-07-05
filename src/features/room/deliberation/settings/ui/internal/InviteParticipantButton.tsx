import { Button } from "@briom/components/ui/button";
import { UserPlus2Icon } from "lucide-react";

export function InviteParticipantButton() {
	return (
		<Button variant="secondary">
			<UserPlus2Icon />
			Invite Participant
		</Button>
	);
}
