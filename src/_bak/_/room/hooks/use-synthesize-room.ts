import { isServerError } from "@briom/libs/server-action";
import {
	failSynthesis,
	generateSynthesis,
	initiateSynthesis,
	saveSynthesis,
} from "@briom/rooms/_/room/actions";
import { useRoomInvalidation } from "@briom/rooms/_/room/queries/invalidations/use-room.invalidation";
import { useSynthesisSheetStore } from "@briom/rooms/_/room/store/use-synthesis-sheet.store";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

interface UseSynthesizeRoomInput {
	roomId: string;
}

interface UseSynthesizeRoomReturn {
	isLoading: boolean;
	synthesize: (participantId: string) => Promise<void>;
}

export function useSynthesizeRoom({
	roomId,
}: UseSynthesizeRoomInput): UseSynthesizeRoomReturn {
	const { invalidate: invalidateRoom } = useRoomInvalidation();
	const openSheet = useSynthesisSheetStore((s) => s.open);

	const initiateMutation = useMutation({
		mutationFn: async (participantId: string) => {
			const initiateResult = await initiateSynthesis({ roomId });
			if (isServerError(initiateResult)) {
				throw new Error(initiateResult.error.message);
			}

			const generateResult = await generateSynthesis({ roomId, participantId });
			if (isServerError(generateResult)) {
				throw new Error(generateResult.error.message);
			}

			const { content, createdBy } = generateResult.data;
			const saveResult = await saveSynthesis({
				roomId,
				content,
				createdBy,
			});

			if (isServerError(saveResult)) throw new Error(saveResult.error.message);
			return { content, createdBy };
		},
		onSuccess: () => {
			openSheet();
			invalidateRoom(roomId);
		},
		onError: async (error) => {
			await failSynthesis({ roomId });
			invalidateRoom(roomId);
			toast.error("Failed to synthesize", { description: error.message });
		},
	});

	const synthesize = useCallback(
		async (participantId: string) => {
			await initiateMutation.mutateAsync(participantId);
		},
		[initiateMutation],
	);

	return {
		isLoading: initiateMutation.isPending,
		synthesize,
	};
}
