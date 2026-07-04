import { useModerator } from "@briom/app/_/moderator";
import { app } from "@briom/libs/server-action";
import type { SubmitHandler } from "@formisch/react";
import { remove, reset, useFieldArray, useForm } from "@formisch/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { formRoom } from "../actions/form-room.action";
import { roomQueryKeys } from "../queries/internal/query.keys";
import { RoomFormSchema } from "./schema";

interface UseRoomFormSubmissionOptions {
	/**
	 * Called when the submission handler has successfully
	 * processed the form. The ID can be used for client to
	 * redirect the user then.
	 *
	 * @param roomId - ID of the formed room.
	 */
	onRoomFormed: (roomId: string) => void;
}

function useRoomFormSubmission({ onRoomFormed }: UseRoomFormSubmissionOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: formRoom,
		onSuccess: ({ data }) => {
			const { roomId, warning } = data;
			if (warning) toast.warning("Warning", { description: warning });

			queryClient
				.invalidateQueries({ queryKey: roomQueryKeys.all })
				.then(() => onRoomFormed(roomId));
		},
		onError: (error) => {
			toast.error("Failed to form room", { description: app(error).message });
		},
	});

	const submitHandler: SubmitHandler<RoomFormSchema> = (output) => {
		mutation.mutate({
			participants: output.participants.map(
				({ displayName, model, provider }) => ({
					displayName,
					model,
					provider,
				}),
			),
			title: output.title,
		});
	};

	return { isPending: mutation.isPending, submitHandler };
}

interface UseRoomFormOptions {
	/**
	 * @description
	 * ID of the form where button outside the form structure
	 * can still consume.
	 *
	 * The ID is being passed-through, ensuring consistency
	 * across the component.
	 *
	 * @default "room-form"
	 */
	id?: string;

	/**
	 * Called when the submission handler has successfully
	 * processed the form. The ID can be used for client to
	 * redirect the user then.
	 *
	 * @param roomId - ID of the formed room.
	 */
	onRoomFormed: (roomId: string) => void;
}

export function useRoomForm({
	id = "room-form",
	onRoomFormed,
}: UseRoomFormOptions) {
	const {
		limit: { maximumParticipantPerRoom },
	} = useModerator();

	const mutation = useRoomFormSubmission({ onRoomFormed });
	const form = useForm({
		schema: RoomFormSchema(maximumParticipantPerRoom),
		initialInput: {
			title: "",
			participants: [],
		},
	});

	const participants = useFieldArray(form, { path: ["participants"] }).items;

	const resetHandler = useCallback(() => void reset(form), [form]);
	const uninviteParticipantHandler = useCallback(
		(index: number) => void remove(form, { at: index, path: ["participants"] }),
		[form],
	);

	return {
		form,
		id,
		isForming: form.isSubmitting || mutation.isPending,
		maxParticipants: maximumParticipantPerRoom,
		maxParticipantsReached: participants.length === maximumParticipantPerRoom,
		uninviteParticipant: uninviteParticipantHandler,
		reset: resetHandler,
		submit: mutation.submitHandler,
	};
}
