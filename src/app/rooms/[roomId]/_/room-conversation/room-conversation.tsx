"use client";

import { sendMessage } from "@briom/api/rooms/actions";
import type { RoomDTO, TurnDTO } from "@briom/app/queries/get-room/query.dto";
import { INTENT } from "@briom/core/domain";
import { useIsHydrated } from "@briom/hooks/is-hydrated";
import { cn } from "@briom/libs/utils";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { ConversationInput } from "./conversation-input";
import { pickAutoResponder } from "./conversation-message/responded-picker";
import { ConversationTimeline } from "./conversation-timeline";
import { RoomConversationLoading } from "./loading";
import { StreamErrorBanner } from "./stream-error-banner";
import { useStream } from "./use-stream";

interface RoomConversationProps {
	initialRoom: RoomDTO;
}

export function RoomConversation({ initialRoom }: RoomConversationProps) {
	const isHydrated = useIsHydrated();

	const [streamError, setStreamError] = useState<string | null>(null);
	const [turns, setTurns] = useState<TurnDTO[]>(
		initialRoom.turns.filter((t) => t.status === "settled"),
	);

	const { participants, id: roomId } = initialRoom;

	const onTurnComplete = useCallback(
		(
			content: string,
			participantId: string,
			intent: string,
			turnId: string,
		) => {
			setStreamError(null);
			setTurns((prev) => [
				...prev,
				{
					id: turnId,
					sequenceNumber: prev.length,
					role: "participant",
					participantId,
					intent,
					content,
					status: "settled",
					createdAt: new Date().toISOString(),
				} satisfies TurnDTO,
			]);
		},
		[],
	);

	const {
		abort,
		streaming,
		streamingContent,
		streamingParticipantId,
		generate,
		retry,
		retryInfo,
	} = useStream({
		initialTurns: initialRoom.turns,
		onError: setStreamError,
		onTurnComplete,
		roomId,
	});

	async function handleSendMessage(
		content: string,
		mentionedParticipantId?: string,
	): Promise<boolean> {
		const stripped = content.replace(/@\S+/g, "").trim();
		if (!stripped && !mentionedParticipantId) return false;

		setStreamError(null);

		const tempId = crypto.randomUUID();
		const optimisticTurn: TurnDTO = {
			id: tempId,
			sequenceNumber: turns.length,
			role: "user",
			participantId: null,
			intent: null,
			content,
			status: "settled",
			createdAt: new Date().toISOString(),
		};
		setTurns((prev) => [...prev, optimisticTurn]);

		const result = await sendMessage(roomId, content);
		if (!result.success) {
			setTurns((prev) => prev.filter((t) => t.id !== tempId));
			toast.error("Failed to send message", {
				description: result.error.message,
			});
			return false;
		}

		setTurns((prev) =>
			prev.map((t) => (t.id === tempId ? { ...t, id: result.data.turnId } : t)),
		);

		if (mentionedParticipantId) {
			const target = participants.find((p) => p.id === mentionedParticipantId);
			if (target) void generate(target.id, INTENT.DIRECT);
		} else {
			const autoResponder = pickAutoResponder(participants, turns);
			if (autoResponder) {
				if (participants.length === 1) {
					void generate(autoResponder.id, INTENT.RESPOND);
				} else {
					const delay = 300 + Math.random() * 600;
					setTimeout(
						() => void generate(autoResponder.id, INTENT.RESPOND),
						delay,
					);
				}
			}
		}

		return true;
	}

	async function handleSuggestion(participantId: string, intent: string) {
		setStreamError(null);
		await generate(participantId, intent);
	}

	return (
		<div className="relative flex flex-1 flex-col min-w-0 min-h-0">
			{!isHydrated && <RoomConversationLoading />}
			<ConversationTimeline
				className={cn(!isHydrated && "invisible")}
				generating={streaming}
				onSuggestionSelected={handleSuggestion}
				participants={participants}
				streamingContent={streamingContent}
				streamingParticipantId={streamingParticipantId}
				turns={turns}
			/>
			{streamError && retryInfo && (
				<StreamErrorBanner
					message={streamError}
					onDismiss={() => setStreamError(null)}
					onRetry={retry}
				/>
			)}
			<div className="sticky bottom-0 inset-x-0 p-4 md:p-8 pt-0!">
				<ConversationInput
					disabled={streaming}
					isStreaming={streaming}
					onAbort={abort}
					onSend={handleSendMessage}
					participants={participants}
				/>
			</div>
		</div>
	);
}
