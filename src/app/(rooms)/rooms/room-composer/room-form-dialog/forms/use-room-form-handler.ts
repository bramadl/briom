import { useRouter } from "@bprogress/next";
import { getCurrentUserId } from "@briom/rooms/api/lib/faker";
import { queryKeys } from "@briom/rooms/api/queries/keys";
import { formRoom, inviteParticipant } from "@briom/rooms/api/room.actions";
import type { SubmitHandler } from "@formisch/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { RoomFormSchema } from "./schema";

export type FormStep =
	| { kind: "idle" }
	| { kind: "forming" }
	| { kind: "inviting"; current: number; total: number; name: string }
	| { kind: "redirecting" }
	| { kind: "error"; step: "forming" | "inviting"; message: string };

interface UseRoomFormhandlerOptions {
	onRoomFormed: () => void;
}

export function useRoomFormHandler({
	onRoomFormed,
}: UseRoomFormhandlerOptions) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const formRoomMutation = useMutation({
		mutationFn: formRoom,
		onSuccess: (data) => {
			if (data.success) {
				queryClient.invalidateQueries({ queryKey: queryKeys.rooms.list() });
				toast.success("Room formed", {
					description: "Now inviting perspectives...",
				});
			}
		},
	});

	const inviteMutation = useMutation({
		mutationFn: inviteParticipant,
		onSuccess: (data, variables) => {
			if (data.success) {
				toast.success(`${variables.displayName} joined`, {
					description: "Ready to deliberate.",
				});
			}
		},
	});

	const handleSubmit: SubmitHandler<typeof RoomFormSchema> = async (output) => {
		const roomResult = await formRoomMutation.mutateAsync({
			title: output.title,
			moderatorId: getCurrentUserId(),
		});

		if (!roomResult.success) {
			toast.error("Couldn't form room", {
				description: roomResult.error.message,
			});
			return;
		}

		const roomId = roomResult.data.roomId;

		const total = output.participants.length;
		const failed: Array<{ name: string; error: string }> = [];

		for (let i = 0; i < total; i++) {
			const p = output.participants[i];
			const inviteResult = await inviteMutation.mutateAsync({
				roomId,
				displayName: p.displayName,
				model: p.model,
				provider: p.provider,
			});

			if (!inviteResult.success) {
				failed.push({ name: p.displayName, error: inviteResult.error.message });
				toast.error(`${p.displayName} couldn't join`, {
					description: inviteResult.error.message,
				});
			}
		}

		const invitedCount = total - failed.length;
		if (failed.length > 0) {
			toast.warning("Room ready with partial roster", {
				description: `${invitedCount} of ${total} perspectives connected. You can invite the rest from the room panel.`,
			});
		} else {
			toast.success("Room ready", {
				description: `${invitedCount} perspectives invited. Prepare to bring your first topic into the room.`,
			});
		}

		onRoomFormed();
		router.push(`/rooms/${roomId}`, { delay: 300, stopDelay: 800 });
	};

	return {
		handleSubmit,
		isForming: formRoomMutation.isPending,
		isInviting: inviteMutation.isPending,
		formError: formRoomMutation.error,
		inviteError: inviteMutation.error,
	};
}
