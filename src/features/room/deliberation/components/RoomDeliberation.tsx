"use client";

import { useRoom } from "@briom/room/hooks/use-room";
import { useInitiateTurnMutation } from "@briom/room/turns/hooks/use-initiate-turn-mutation";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { toast } from "sonner";

import type { PendingAttachment } from "../attachments/utils/attachment.types";
import type { Mentionee } from "../editor/helpers/mention-extractor";
import { useDeliberationRealtime } from "../hooks/use-deliberation-realtime";
import { useIsRoomReadOnly } from "../hooks/use-deliberation-store";
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
	const { isConcluded, isMultiDeliberation, room, roomId } = useRoom();
	const participants = useMemo(
		() => room.info.participants,
		[room.info.participants],
	);

	const isStoreReadOnly = useIsRoomReadOnly();
	const isReadOnly = isConcluded || isStoreReadOnly;

	const canEdit = !isReadOnly;
	const canMention = isMultiDeliberation;

	const mutation = useInitiateTurnMutation(roomId);
	const initateTurn = async (
		content: string,
		mentionees: Mentionee[],
		attachments: PendingAttachment[],
	) => {
		try {
			await mutation.mutateAsync({
				roomId,
				content,
				mentionedParticipantIds: mentionees.map((m) => m.id),
				attachments: attachments.map((a) => ({
					url: a.url,
					name: a.name,
					mimeType: a.mimeType,
					sizeBytes: a.sizeBytes,
					mediaType: a.mediaType,
					content: a.content,
				})),
			});

			// @todo Optimistic Update strategy.
		} catch (error) {
			toast.error("Failed to send", { description: (error as Error).message });
			throw error;
		}
	};

	useDeliberationRealtime({
		roomId,
		moderatorId: room.info.metadata.moderatorId,
	});

	return (
		<div className="relative min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden">
			<div className="flex-1 flex flex-col gap-8 p-8 lg:py-16 min-w-0 min-h-0 overflow-y-auto no-scrollbar overflow-x-hidden">
				<RoomSequence />
			</div>
			<div className="sticky bottom-0 z-10 shrink-0 p-8 pt-0">
				<DeliberationEditor
					canEdit={canEdit}
					canMention={canMention}
					isPending={mutation.isPending}
					isStreaming={false}
					onAbort={() => {}}
					onSend={initateTurn}
					participants={participants}
				/>
			</div>
		</div>
	);
}
