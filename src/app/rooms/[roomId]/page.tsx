import { getRoom } from "@briom/api/rooms/actions";
import { notFound } from "next/navigation";

import { RoomActions } from "./_/room-actions";
import { RoomConversation } from "./_/room-conversation";
import { RoomHeader } from "./_/room-header";
import { RoomPanel } from "./_/room-panel";

interface RoomPageProps {
	params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
	const { roomId } = await params;

	const result = await getRoom(roomId);
	if (!result.success) {
		if (result.error.kind === "NOT_FOUND") return notFound();
		throw new Error(result.error.message);
	}

	const room = result.data;

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-col h-full overflow-hidden">
				<RoomHeader title={room.title}>
					<RoomActions roomId={room.id} />
				</RoomHeader>
				<div className="flex flex-1 overflow-hidden">
					<RoomConversation initialRoom={room} />
					<RoomPanel room={room} />
				</div>
			</div>
		</div>
	);
}
