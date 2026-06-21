"use client";

import { getModeratorId } from "@briom/rooms/api/lib/faker";
import {
	useFormRoomMutation,
	useInviteParticipantMutation,
} from "@briom/rooms/hooks/mutations";
import type { SubmitHandler } from "@formisch/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { RoomFormSchema } from "./schema";

interface UseRoomFormSubmissionOptions {
	onRoomFormed: () => void;
}

export function useRoomFormSubmission({
	onRoomFormed,
}: UseRoomFormSubmissionOptions) {
	const router = useRouter();

	const formRoomMutation = useFormRoomMutation();
	const inviteMutation = useInviteParticipantMutation();

	const isForming = formRoomMutation.isPending;
	const isInviting = inviteMutation.isPending;
	const isSubmitting = isForming || isInviting;

	const handleSubmit: SubmitHandler<typeof RoomFormSchema> = async (output) => {
		const result = await formRoomMutation.mutateAsync({
			title: output.title,
			moderatorId: getModeratorId(),
		});

		if (!result.success) {
			toast.error("Couldn't form room", { description: result.error.message });
			return;
		}

		const roomId = result.data.roomId;
		const total = output.participants.length;
		const failed: Array<{ name: string; error: string }> = [];

		for (let i = 0; i < total; i++) {
			const p = output.participants[i];
			const result = await inviteMutation.mutateAsync({
				roomId,
				displayName: p.displayName,
				model: p.model,
				provider: p.provider,
			});

			if (!result.success) {
				failed.push({ name: p.displayName, error: result.error.message });
				toast.error(`${p.displayName} couldn't join`, {
					description: result.error.message,
				});
			}
		}

		const invitedCount = total - failed.length;
		if (failed.length > 0) {
			toast.warning("Room ready with partial roster", {
				description: `${invitedCount} of ${total} participants connected.`,
			});
		} else {
			toast.success("Room ready", {
				description: `${invitedCount} participants invited.`,
			});
		}

		onRoomFormed();
		router.push(`/rooms/${roomId}`);
	};

	return {
		handleSubmit,
		isForming,
		isInviting,
		isSubmitting,
	};
}
