import { getModeratorId } from "@briom/libs/faker";
import { isServerError } from "@briom/libs/server-action";
import type { SubmitHandler } from "@formisch/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { inviteParticipant } from "../../participant/actions";
import { formRoom } from "../actions";

import { inviteSequentially } from "./helpers/form-submission.helper";
import type { RoomFormSchema } from "./schema";

interface UseRoomFormSubmissionOptions {
	onRoomFormed?: (roomId: string) => void;
}

export function useRoomFormSubmission({
	onRoomFormed,
}: UseRoomFormSubmissionOptions) {
	const formRoomMutation = useMutation({ mutationFn: formRoom });
	const inviteMutation = useMutation({ mutationFn: inviteParticipant });

	const isForming = formRoomMutation.isPending;
	const isInviting = inviteMutation.isPending;
	const isProcessing = isForming || isInviting;

	const handleSubmit: SubmitHandler<typeof RoomFormSchema> = async (output) => {
		const roomResult = await formRoomMutation.mutateAsync({
			title: output.title,
			moderatorId: getModeratorId(),
		});

		if (isServerError(roomResult)) {
			return toast.error("Couldn't form room", {
				description: roomResult.error.message,
			});
		}

		const roomId = roomResult.data.roomId;
		toast.success("Room formed", { description: "Inviting participants..." });

		const { summary } = await inviteSequentially({
			roomId,
			participants: output.participants,
			invite: inviteMutation.mutateAsync,
		});

		if (summary.hasPartialFailure) {
			toast.warning("Room ready with partial roster", {
				description: `${summary.success} of ${summary.total} participants connected.`,
			});
		} else {
			toast.success("Room ready", {
				description: `${summary.success} participants invited.`,
			});
		}

		if (summary.failed.length > 0) {
			toast.error("Some participants failed", {
				description: summary.failed
					.map((f) => `${f.name}: ${f.error}`)
					.join("\n"),
			});
		}

		onRoomFormed?.(roomId);
	};

	return {
		handleSubmit,
		isForming,
		isInviting,
		isProcessing,
	};
}
