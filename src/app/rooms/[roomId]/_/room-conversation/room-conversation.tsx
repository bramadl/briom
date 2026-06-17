"use client";

import { sendMessage } from "@briom/api/rooms/actions";
import type { RoomDTO, TurnDTO } from "@briom/app/queries/get-room/query.dto";
import { INTENT } from "@briom/core/domain";
import { cn } from "@briom/libs/utils";
import { useState } from "react";
import { toast } from "sonner";

import { ConversationInput } from "./conversation-input";
import { pickAutoResponder } from "./conversation-message/responded-picker";
import { ConversationTimeline } from "./conversation-timeline";
import { RoomConversationLoading } from "./loading-conversation";
import { RetryStreamBanner, useResponseStream } from "./stream-experience";

interface RoomConversationProps {
	initialRoom: RoomDTO;
}

export function RoomConversation({ initialRoom }: RoomConversationProps) {
	const [isHydrated, setIsHydrated] = useState(false);

	const { participants, id: roomId } = initialRoom;

	// ← CHANGED: Simpan SEMUA turns (pending, settled, failed) untuk tracking
	const [allTurns, setAllTurns] = useState<TurnDTO[]>(initialRoom.turns);
	// ← CHANGED: Filter hanya settled untuk display di timeline
	const settledTurns = allTurns.filter((t) => t.status === "settled");

	const {
		abort,
		dismissError,
		generate,
		retry,
		retryInfo,
		streamError,
		streaming,
		streamingContent,
		streamingParticipantId,
		streamPhase,
	} = useResponseStream({
		turns: allTurns, // ← CHANGED: pass semua turns, bukan hanya settled
		onTurnComplete: (
			content: string,
			_participantId: string,
			_intent: string,
			turnId: string,
		) => {
			// ← CHANGED: Update allTurns saat stream selesai
			setAllTurns((prev) =>
				prev.map((t) =>
					t.id === turnId ? { ...t, status: "settled" as const, content } : t,
				),
			);
		},
		roomId,
	});

	const handleSuggestion = async (participantId: string, intent: string) => {
		await generate(participantId, intent);
	};

	const handleSendMessage = async (
		content: string,
		mentionedParticipantId?: string,
	): Promise<boolean> => {
		const stripped = content.replace(/@\S+/g, "").trim();
		if (!stripped && !mentionedParticipantId) return false;

		const tempId = crypto.randomUUID();
		const optimisticTurn: TurnDTO = {
			id: tempId,
			sequenceNumber: allTurns.length, // ← CHANGED: dari turns.length
			role: "user",
			participantId: null,
			intent: null,
			content,
			status: "settled",
			createdAt: new Date().toISOString(),
		};

		// ← CHANGED: setAllTurns, bukan setTurns
		setAllTurns((prev) => [...prev, optimisticTurn]);

		const result = await sendMessage(roomId, content);
		if (!result.success) {
			// ← CHANGED: setAllTurns
			setAllTurns((prev) => prev.filter((t) => t.id !== tempId));
			toast.error("Failed to send message", {
				description: result.error.message,
			});
			return false;
		}

		// ← CHANGED: setAllTurns
		setAllTurns((prev) =>
			prev.map((t) => (t.id === tempId ? { ...t, id: result.data.turnId } : t)),
		);

		if (mentionedParticipantId) {
			const target = participants.find((p) => p.id === mentionedParticipantId);
			if (target) void generate(target.id, INTENT.DIRECT);
		} else {
			// ← CHANGED: allTurns, bukan turns
			const autoResponder = pickAutoResponder(participants, allTurns);
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
	};

	return (
		<div
			className={cn(
				"relative flex flex-1 flex-col min-w-0 min-h-0",
				!isHydrated && "pointer-events-none",
			)}
		>
			{!isHydrated && <RoomConversationLoading />}

			<ConversationTimeline
				className={cn(!isHydrated && "opacity-0")}
				generating={streaming}
				onSuggestionSelected={handleSuggestion}
				onTimelineReady={() => setIsHydrated(true)}
				participants={participants}
				streamingContent={streamingContent}
				streamingParticipantId={streamingParticipantId}
				streamPhase={streamPhase}
				turns={settledTurns} // ← CHANGED: hanya settled untuk display
			/>

			<div className="sticky bottom-0 inset-x-0 pb-4 md:pb-8">
				<div className="flex flex-col gap-4 mg:gap-8 px-4 md:px-8 max-w-4xl mx-auto">
					{retryInfo && (
						<RetryStreamBanner
							onDismiss={dismissError}
							onRetry={retry}
							participantId={retryInfo.participantId}
							participants={participants}
							retryAfter={
								streamError?.kind === "RATE_LIMITED"
									? streamError.retryAfter
									: undefined
							}
							streamError={streamError}
						/>
					)}

					<ConversationInput
						disabled={streaming}
						isStreaming={streaming}
						onAbort={abort}
						onSend={handleSendMessage}
						participants={participants}
					/>
				</div>
			</div>
		</div>
	);
}
