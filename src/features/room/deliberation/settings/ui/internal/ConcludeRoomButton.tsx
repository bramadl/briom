import { Button } from "@briom/components/ui/button";
import { ConciergeBellIcon } from "lucide-react";

export function ConcludeRoomButton() {
	return (
		<Button variant="secondary">
			<ConciergeBellIcon />
			Conclude Room
		</Button>
	);
}
