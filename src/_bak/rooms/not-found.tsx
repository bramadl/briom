import { Button } from "@briom/components/ui/button";
import { ErrorState } from "@briom/ui/error-state";
import Link from "next/link";

export default function RoomNotFound() {
	return (
		<ErrorState
			code="404"
			description="This room doesn't exist, or you may not have access to it."
			title="Room not found"
		>
			<Button asChild>
				<Link href="/rooms">Back to rooms</Link>
			</Button>
		</ErrorState>
	);
}
