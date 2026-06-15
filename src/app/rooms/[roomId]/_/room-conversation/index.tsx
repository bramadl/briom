"use client";

import { addUserMessage, getRoom, } from "@briom/api/rooms/actions";
import type { RoomDTO } from "@briom/app/queries/get-room/query.dto";
import { toast } from "sonner";
import { useState } from "react";

import { ConversationInput } from "./conversation-input";
import { ConversationTimeline } from "./conversation-timeline";
import { useStream } from "./use-stream";

interface RoomConversationProps {
  initialRoom: RoomDTO;
}

export function RoomConversation({ initialRoom }: RoomConversationProps) {
  const [room, setRoom] = useState(initialRoom);

  const { streaming, streamingContent, streamingParticipantId, generate } =
    useStream({
      onError: (message) => {
        toast.error(message, {
          description: "The response wasn't saved — try again.",
        });
      },
      onTurnComplete: async () => void await refreshRoom(),
      roomId: room.id,
    });

  async function refreshRoom() {
    const updated = await getRoom(room.id);
    if (updated.room) setRoom(updated.room);
  }

  async function handleUserMessage(content: string) {
    await addUserMessage(room.id, content);
    await refreshRoom();
  }

  async function handleSuggestion(participantId: string, intent: string) {
    await generate(participantId, intent);
  }

  return (
    <div className="flex flex-1 flex-col min-w-0 min-h-0">
      <ConversationTimeline
        generating={streaming}
        onSuggestionSelected={handleSuggestion}
        participants={room.participants}
        streamingContent={streamingContent}
        streamingParticipantId={streamingParticipantId}
        turns={room.turns}
      />
      <div className="sticky bottom-0 inset-x-0 p-4 md:p-8 pt-0!">
        <ConversationInput
          participants={room.participants}
          disabled={streaming}
          isStreaming={streaming}
          onSend={handleUserMessage}
        />
      </div>
    </div>
  );
}