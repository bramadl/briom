"use client";

import type { RoomDTO } from "@briom/app/queries/get-room/query.dto";
import { useCallback, useRef, useState } from "react";

import { ConversationInput } from "./conversation-input";
import { ConversationTimeline } from "./conversation-timeline";

interface RoomConversationProps {
	initialRoom: RoomDTO;
}

export function RoomConversation({ initialRoom }: RoomConversationProps) {
	const [room, setRoom] = useState(initialRoom);
	const [generating, setGenerating] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	async function refreshRoom() {
		const res = await fetch(`/api/rooms/${room.id}`);
		if (res.ok) {
			const data = await res.json();
			setRoom(data.room);
			scrollToBottom();
		}
	}

	async function handleUserMessage(content: string) {
		await fetch(`/api/rooms/${room.id}/turns`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		});
		await refreshRoom();
	}

	async function handleSuggestion(participantId: string, intent: string) {
		setGenerating(true);
		try {
			await fetch(`/api/rooms/${room.id}/turns/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ participantId, intent }),
			});
			await refreshRoom();
		} finally {
			setGenerating(false);
		}
	}

	return (
		<div className="flex flex-1 flex-col min-w-0">
			<ConversationTimeline
				generating={generating}
				onSuggestionSelected={handleSuggestion}
				participants={room.participants}
				turns={room.turns}
			/>
			<div ref={bottomRef} />
			<div className="sticky bottom-0 inset-x-0 p-8 pt-0">
				<ConversationInput disabled={generating} onSend={handleUserMessage} />
			</div>
		</div>
	);
}
