import type { RoomDTO } from "@briom/app";
import { Button } from "@briom/components/ui/button";
import { CheckCircleIcon, ScrollTextIcon, Share2Icon } from "lucide-react";

export function RoomActions({ room }: { room: RoomDTO }) {
	const canShare = room.status !== "forming";
	const canConclude =
		room.status === "deliberating" || room.status === "paused";

	return (
		<div className="flex items-center gap-1">
			{canConclude && (
				<Button size="sm" variant="secondary">
					<CheckCircleIcon className="size-4 mr-1.5" />
					Conclude
				</Button>
			)}
			{canShare && (
				<Button size="sm" variant="secondary">
					<Share2Icon className="size-4 mr-1.5" />
					Share
				</Button>
			)}
			{(room.status === "deliberating" || room.status === "paused") && (
				<Button size="sm" variant="secondary">
					<ScrollTextIcon className="size-4 mr-1.5" />
					Summarize
				</Button>
			)}
		</div>
	);
}
