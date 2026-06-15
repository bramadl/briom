import { briom } from "@briom";
import { notFound } from "next/navigation";

import { RoomConversation } from "./_/room-conversation";
import { RoomHeader } from "./_/room-header";
import { RoomPanel } from "./_/room-panel";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  const result = await briom.getRoom({ roomId });

  const { room } = result.value();
  if (result.isError() || !room) return notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col overflow-hidden">
        <RoomHeader title={room.title} />
        <div className="flex flex-1 overflow-hidden">
          <RoomConversation initialRoom={room} />
          <RoomPanel room={room} />
        </div>
      </div>
    </div>
  );
}
