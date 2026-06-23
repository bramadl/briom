"use client";

import { isServerError } from "@briom/libs/server-action";
import { formRoom } from "@briom/rooms/_/room/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useRoomsInvalidation } from "../queries/invalidations";

export function useFormRoomMutation() {
	const { invalidate } = useRoomsInvalidation();

	return useMutation({
		mutationFn: formRoom,
		onSuccess: (result) => {
			if (isServerError(result)) {
				toast.error("Couldn't form room", {
					description: result.error.message,
				});
				return;
			}

			invalidate();
			toast.success("Room formed", {
				description: "Now inviting participants...",
			});
		},
		onError: (error) => {
			toast.error("Couldn't form room", { description: error.message });
		},
	});
}
