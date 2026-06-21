import { reset, useForm } from "@formisch/react";
import { useEffect } from "react";

import { RoomFormSchema } from "./schema";

interface UseRoomFormOptions {
	resetIf?: boolean;
}

export function useRoomForm({ resetIf: shouldReset }: UseRoomFormOptions) {
	const id = "room-form";

	const form = useForm({
		schema: RoomFormSchema,
		initialInput: {
			title: "",
			participants: [],
		},
	});

	useEffect(() => {
		if (shouldReset) reset(form);
	}, [form, shouldReset]);

	return {
		id,
		form,
		reset: () => reset(form),
	};
}
