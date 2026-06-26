"use client";

import { useRoom } from "@briom/rooms/_/room/hooks/use-room";
import { useSynthesisSheetStore } from "@briom/rooms/_/room/store/use-synthesis-sheet.store";
import { useParams } from "next/navigation";

import { SynthesisSheet } from "./_/synthesis-sheet";

export function SynthesisSheetProvider() {
	const { roomId } = useParams<{ roomId: string }>();
	const { room } = useRoom(roomId);

	const isOpen = useSynthesisSheetStore((s) => s.isOpen);
	const close = useSynthesisSheetStore((s) => s.close);

	if (!room.synthesis) return null;
	return (
		<SynthesisSheet
			content={room.synthesis.content}
			onOpenChange={(open) => {
				if (!open) close();
			}}
			open={isOpen}
		/>
	);
}
