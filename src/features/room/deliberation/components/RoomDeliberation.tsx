"use client";

import { cn } from "@briom/libs/utils";
import { useRoom } from "@briom/room/hooks/use-room";
import { useIsTurnSlotClaimed } from "@briom/room/store/room-stream.store";
import { useAbortTurnMutation } from "@briom/room/turns/hooks/use-abort-turn-mutation";
import { useInitiateTurnMutation } from "@briom/room/turns/hooks/use-initiate-turn-mutation";
import {
	useActiveTurnId,
	useActiveTurnPhase,
} from "@briom/room/turns/store/turn-stream.store";
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import type { PendingAttachment } from "../attachments/utils/attachment.types";
import type { Mentionee } from "../editor/helpers/mention-extractor";
import { useDeliberationRealtime } from "../hooks/use-deliberation-realtime";
import { useStickToBottom } from "../hooks/use-stick-to-bottom";
import { RoomLoader } from "./internal/RoomLoader";

const RoomSequence = dynamic(
	async () => (await import("./internal/RoomSequence")).RoomSequence,
	{ loading: RoomLoader, ssr: false },
);

const DeliberationEditor = dynamic(
	async () =>
		(await import("../editor/ui/DeliberationEditor")).DeliberationEditor,
	{ ssr: false },
);

export function RoomDeliberation() {
	const { isConcluded, isFrozen, isLocked, isMultiDeliberation, room, roomId } =
		useRoom();

	const roomState = useMemo(() => room.state, [room.state]);
	const participants = useMemo(
		() => room.info.participants,
		[room.info.participants],
	);

	const isTurnSlotClaimed = useIsTurnSlotClaimed();
	const isReadOnly = isConcluded || isFrozen || isLocked || isTurnSlotClaimed;

	const canEdit = !isReadOnly;
	const canMention = isMultiDeliberation;

	const mutation = useInitiateTurnMutation(roomId);

	const { contentRef, forceScrollToBottom, scrollContainerRef } =
		useStickToBottom<HTMLDivElement>();

	const initateTurn = async (
		content: string,
		mentionees: Mentionee[],
		attachments: PendingAttachment[],
	) => {
		try {
			const pending = mutation.mutateAsync({
				attachments: attachments.map((a) => ({
					url: a.url,
					name: a.name,
					mimeType: a.mimeType,
					sizeBytes: a.sizeBytes,
					mediaType: a.mediaType,
					content: a.content,
				})),
				content,
				mentionedParticipantIds: mentionees.map((m) => m.id),
				moderatorTurnId: crypto.randomUUID(),
				roomId,
			});

			forceScrollToBottom("smooth");
			await pending;
		} catch (error) {
			toast.error("Failed to send", { description: (error as Error).message });
			throw error;
		}
	};

	const activeTurnId = useActiveTurnId();
	const activeTurnPhase = useActiveTurnPhase();
	const abortMutation = useAbortTurnMutation();

	const isStreaming = activeTurnPhase === "streaming";
	const abortTurn = useCallback(() => {
		if (!activeTurnId) return;
		abortMutation.mutate({ roomId, turnId: activeTurnId });
	}, [abortMutation, roomId, activeTurnId]);

	useDeliberationRealtime({
		roomId,
		moderatorId: room.info.metadata.moderatorId,
		initialTurns: room.info.turns,
	});

	return (
		<div className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			{roomState && (
				<div
					className={cn(
						"p-4 text-sm",
						roomState.kind === "frozen"
							? "bg-dusty-blue-background text-dusty-blue"
							: "bg-terracotta-background text-terracotta",
					)}
				>
					<p className="font-semibold">
						{roomState.kind === "frozen" ? "Room Frozen" : "Room Locked"}
					</p>
					<p className="text-xs">{roomState.reason}</p>
				</div>
			)}
			<div
				className="flex-1 flex flex-col gap-8 p-8 lg:py-16 min-w-0 min-h-0 overflow-y-auto no-scrollbar overflow-x-hidden"
				ref={scrollContainerRef}
			>
				<RoomSequence contentRef={contentRef} />
			</div>
			{!isConcluded && (
				<div className="sticky bottom-0 z-10 shrink-0 p-8 pt-0">
					<DeliberationEditor
						canEdit={canEdit}
						canMention={canMention}
						canSend={!isReadOnly}
						isPending={mutation.isPending}
						isStreaming={isStreaming}
						onAbort={abortTurn}
						onSend={initateTurn}
						participants={participants}
					/>
				</div>
			)}
		</div>
	);
}
