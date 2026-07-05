import { useModerator } from "@briom/moderator/hooks/use-moderator";
import { useRoomFormMutation } from "@briom/room/hooks/use-room-form-mutation";
import {
	remove,
	reset,
	type SubmitHandler,
	useFieldArray,
	useForm,
} from "@formisch/react";
import { useCallback } from "react";

import { RoomFormSchema } from "../schema/schema";

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

	const mutation = useRoomFormMutation();

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

	const submitHandler: SubmitHandler<RoomFormSchema> = useCallback(
		(output) => {
			mutation.mutate(
				{
					participants: output.participants.map(
						({ displayName, model, provider }) => ({
							displayName,
							model,
							provider,
						}),
					),
					title: output.title,
				},
				{ onSuccess: ({ data }) => onRoomFormed(data.roomId) },
			);
		},
		[mutation.mutate, onRoomFormed],
	);

	return {
		form,
		id,
		isForming: form.isSubmitting || mutation.isPending,
		maxParticipants: maximumParticipantPerRoom,
		maxParticipantsReached: participants.length === maximumParticipantPerRoom,
		uninviteParticipant: uninviteParticipantHandler,
		reset: resetHandler,
		submit: submitHandler,
	};
}
