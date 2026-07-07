"use client";

import { useRoom } from "@briom/room/hooks/use-room";
import { useIsTurnSlotClaimed } from "@briom/room/store/room-stream.store";
import { useInitiateTurnMutation } from "@briom/room/turns/hooks/use-initiate-turn-mutation";
import dynamic from "next/dynamic";
import { useMemo } from "react";
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

	const participants = useMemo(
		() => room.info.participants,
		[room.info.participants],
	);

	const isTurnSlotClaimed = useIsTurnSlotClaimed();
	const isReadOnly = isConcluded || isFrozen || isLocked || isTurnSlotClaimed;

	const canEdit = !isReadOnly;
	const canMention = isMultiDeliberation;

	const mutation = useInitiateTurnMutation(roomId);

	// `scrollContainerRef` goes on the actual overflow-y-auto element
	// below (this component owns it — it's the thing with `flex-1` and
	// a bounded height). `contentRef` is a callback ref forwarded down
	// to `RoomSequence`, which attaches it to the inner content wrapper
	// that actually grows as turns/tokens stream in — that's the node
	// `ResizeObserver` needs to watch, not the scroll container itself
	// (whose own box size never changes).
	const { contentRef, scrollContainerRef, scrollToBottom } =
		useStickToBottom<HTMLDivElement>();

	const initateTurn = async (
		content: string,
		mentionees: Mentionee[],
		attachments: PendingAttachment[],
	) => {
		scrollToBottom("smooth");

		try {
			await mutation.mutateAsync({
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
		} catch (error) {
			toast.error("Failed to send", { description: (error as Error).message });
			throw error;
		}
	};

	useDeliberationRealtime({
		roomId,
		moderatorId: room.info.metadata.moderatorId,
		initialTurns: room.info.turns,
	});

	return (
		<div className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			<div className="bg-red-950 p-4 text-sm">Some banner</div>
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
						isStreaming={false}
						onAbort={() => {}}
						onSend={initateTurn}
						participants={participants}
					/>
				</div>
			)}
		</div>
	);
}
