import { reset, useFieldArray, useForm } from "@formisch/react";

import { ROOM_SETTING } from "../config/setting";

import { RoomFormSchema } from "../form/schema";
import { useRoomFormSubmission } from "./use-room-form-submission";

interface UseRoomFormOptions {
	id?: string;
	onRoomFormed?: (roomId: string) => void;
}

export function useRoomForm(options?: UseRoomFormOptions) {
	const id = options?.id ?? "room-form";
	const { handleSubmit, isForming, isInviting, isProcessing } =
		useRoomFormSubmission({ onRoomFormed: options?.onRoomFormed });

	const form = useForm({
		schema: RoomFormSchema,
		initialInput: {
			title: "",
			participants: [],
		},
	});

	const participant = useFieldArray(form, { path: ["participants"] });

	const maxParticipants = ROOM_SETTING.MAXIMUM_PARTICIPANT;
	const maxParticipantReached = participant.items.length === maxParticipants;

	const disabled = form.isSubmitting || isForming || isInviting || isProcessing;
	const submitting = form.isSubmitting || isProcessing;

	const resetHandler = () => reset(form);

	return {
		disabled,
		form,
		forming: isForming,
		id,
		inviting: isInviting,
		maxParticipants,
		maxParticipantReached,
		participants: participant.items,
		submit: handleSubmit,
		submitting,
		reset: resetHandler,
	};
}
